from fastapi import FastAPI, Depends, HTTPException, Body
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
import json
import os
from datetime import datetime
from dotenv import load_dotenv
from backend.database import SessionLocal, RetailerVisit, GrowerVisit, Alert, DashboardMetric
import google.generativeai as genai

load_dotenv()
app = FastAPI(title="AgriSense Field Co-Pilot API")

# Setup CORS for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.get("/api/visits")
def get_visits(db: Session = Depends(get_db)):
    try:
        ret_visits = db.query(RetailerVisit).filter(RetailerVisit.status == "Pending").order_by(RetailerVisit.score.desc()).all()
        grw_visits = db.query(GrowerVisit).filter(GrowerVisit.status == "Pending").all()
        
        visits_out = []
        for v in ret_visits:
            visits_out.append({
                "id": v.id, "name": v.name, "type": "Retailer", "priority": v.priority,
                "reason": v.reason, "tehsil": v.tehsil, "sales30d": v.sales30d, "daysCover": v.daysCover,
                "nba": {
                    "product": v.nba_product,
                    "objective": v.nba_objective,
                    "roi": v.nba_roi,
                    "talkingPoints": json.loads(v.nba_talkingPoints) if v.nba_talkingPoints else [],
                    "tags": json.loads(v.nba_tags) if v.nba_tags else []
                }
            })
            
        for v in grw_visits:
            visits_out.append({
                "id": v.id, "name": v.name, "type": "Grower", "priority": v.priority,
                "reason": v.reason, "tehsil": v.tehsil, "crop": v.crop,
                "nba": {
                    "product": v.nba_product,
                    "objective": v.nba_objective,
                    "roi": v.nba_roi,
                    "talkingPoints": json.loads(v.nba_talkingPoints) if v.nba_talkingPoints else [],
                    "tags": json.loads(v.nba_tags) if v.nba_tags else []
                }
            })
            
        return {"visits": visits_out}
    except Exception as e:
        import traceback
        trace = traceback.format_exc()
        # Return a structured error to the frontend
        return {"error": str(e), "trace": trace}

@app.post("/api/visits/{visit_id}/log")
def log_visit(visit_id: str, payload: dict = Body(...), db: Session = Depends(get_db)):
    notes = payload.get("notes", "")
    
    # Generate AI Insight from notes using Gemini
    insight_text = "Standard visit completed."
    if len(notes) > 10:
        api_key = os.getenv("GEMINI_API_KEY")
        if api_key:
            try:
                genai.configure(api_key=api_key)
                prompt = f"Analyze these field visit notes from a Syngenta rep. Give a 1-sentence actionable follow-up or insight. Notes: {notes}"
                try:
                    model = genai.GenerativeModel('gemini-1.5-flash-latest')
                    resp = model.generate_content(prompt)
                    insight_text = resp.text.strip()
                except:
                    model = genai.GenerativeModel('gemini-pro')
                    resp = model.generate_content(prompt)
                    insight_text = resp.text.strip()
            except Exception:
                pass
    
    v_ret = db.query(RetailerVisit).filter(RetailerVisit.id == visit_id).first()
    if v_ret:
        v_ret.status = "Completed"
        v_ret.notes = notes
        v_ret.completed_at = datetime.utcnow()
        db.commit()
        return {"status": "success", "message": "Retailer visit logged", "insight": insight_text}
        
    v_grw = db.query(GrowerVisit).filter(GrowerVisit.id == visit_id).first()
    if v_grw:
        v_grw.status = "Completed"
        v_grw.notes = notes
        v_grw.completed_at = datetime.utcnow()
        db.commit()
        return {"status": "success", "message": "Grower visit logged", "insight": insight_text}
        
    return {"status": "error", "message": "Visit not found"}

@app.get("/api/dashboard")
def get_dashboard(db: Session = Depends(get_db)):
    try:
        dash = db.query(DashboardMetric).first()
        if dash:
            return {
                "sales_vs_target": dash.sales_vs_target,
                "avg_rev": dash.avg_rev,
                "coverage": dash.coverage,
                "nba_acc": dash.nba_acc
            }
        return {}
    except Exception as e:
        import traceback
        return {"error": str(e), "trace": traceback.format_exc()}

@app.get("/api/alerts")
def get_alerts(db: Session = Depends(get_db)):
    try:
        alerts = db.query(Alert).filter(Alert.is_active == True).all()
        return [{"title": a.title, "severity": a.severity, "desc": a.desc, "affected": a.affected} for a in alerts]
    except Exception as e:
        import traceback
        return {"error": str(e), "trace": traceback.format_exc()}

@app.get("/api/products")
def get_products():
    # Dynamically serve product catalog
    return [
        {"id": 1, "name": "Cruiser 350 FS", "type": "Insecticide", "crop": "Cotton, Corn", "feature": "Early season protection", "stock": "High"},
        {"id": 2, "name": "Amistar Top", "type": "Fungicide", "crop": "Wheat, Rice", "feature": "Broad-spectrum control", "stock": "Medium"},
        {"id": 3, "name": "Voliam Targo", "type": "Insecticide", "crop": "Vegetables", "feature": "Long-lasting effect", "stock": "Low"},
        {"id": 4, "name": "Pegasus", "type": "Miticide", "crop": "Cotton, Vegetables", "feature": "Excellent translaminar action", "stock": "High"},
        {"id": 5, "name": "Axial", "type": "Herbicide", "crop": "Wheat", "feature": "Targeted weed control", "stock": "High"},
        {"id": 6, "name": "Kavach", "type": "Fungicide", "crop": "Peanut, Potato", "feature": "Multi-site action", "stock": "Medium"}
    ]

@app.post("/api/chat")
def chat_with_copilot(payload: dict = Body(...)):
    message = payload.get("message", "")
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        return {"response": "System: GEMINI_API_KEY not configured. Mock Response: Your query is acknowledged."}
        
    try:
        genai.configure(api_key=api_key)
        
        system_prompt = """You are Vasudev.ai, a field force Co-Pilot for Syngenta. 
        You provide insights to sales reps based on the provided ML pipeline context. 
        Keep your answers extremely short, professional, and actionable (2-3 sentences max).
        """
        full_prompt = f"{system_prompt}\nUser Query: {message}\nResponse:"
        
        try:
            model = genai.GenerativeModel('gemini-1.5-flash-latest')
            response = model.generate_content(full_prompt)
        except Exception:
            # Fallback for API regions/keys that don't support flash yet
            model = genai.GenerativeModel('gemini-pro')
            response = model.generate_content(full_prompt)
            
        return {"response": response.text}
    except Exception as e:
        return {"response": f"Error reaching AI: {str(e)}"}
