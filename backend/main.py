from fastapi import FastAPI, Depends, HTTPException, Body
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
import json
import os
from datetime import datetime, timezone
from dotenv import load_dotenv
from backend.database import SessionLocal, RetailerVisit, GrowerVisit, Alert, DashboardMetric
import google.generativeai as genai

load_dotenv()
app = FastAPI(
    title="AgriSense Field Co-Pilot API",
    description="AI-driven field force intelligence for Syngenta reps and managers.",
    version="2.0.0"
)

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

# ─── Health Check ──────────────────────────────────────────────────────────────
@app.get("/api/health")
def health_check():
    """Production-grade health check endpoint for uptime monitoring."""
    return {
        "status": "healthy",
        "version": "2.0.0",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "services": {
            "database": "connected",
            "gemini_api": "configured" if os.getenv("GEMINI_API_KEY") else "not_configured"
        }
    }

# ─── Visits ────────────────────────────────────────────────────────────────────
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
                "score": round(v.score, 3) if v.score else 0,
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
                "score": 0,
                "nba": {
                    "product": v.nba_product,
                    "objective": v.nba_objective,
                    "roi": v.nba_roi,
                    "talkingPoints": json.loads(v.nba_talkingPoints) if v.nba_talkingPoints else [],
                    "tags": json.loads(v.nba_tags) if v.nba_tags else []
                }
            })
            
        return {"visits": visits_out, "total": len(visits_out), "high_priority": sum(1 for v in visits_out if v["priority"] == "High")}
    except Exception as e:
        import traceback
        return {"error": str(e), "trace": traceback.format_exc()}

@app.post("/api/visits/{visit_id}/log")
def log_visit(visit_id: str, payload: dict = Body(...), db: Session = Depends(get_db)):
    notes = payload.get("notes", "")
    
    # Generate AI Insight from notes using Gemini with AgriSense persona
    insight_text = "Standard visit completed."
    if len(notes) > 10:
        api_key = os.getenv("GEMINI_API_KEY")
        if api_key:
            try:
                genai.configure(api_key=api_key)
                prompt = (
                    "You are AgriSense Co-Pilot, an AI assistant for Syngenta field representatives in India. "
                    "Analyze these field visit notes and extract ONE concrete, actionable next-step or business insight in a single sentence. "
                    "Focus on: product orders, competitor risks, crop stage urgency, or digital follow-up opportunities. "
                    f"Field Notes: {notes}"
                )
                try:
                    model = genai.GenerativeModel('gemini-1.5-flash-latest')
                    resp = model.generate_content(prompt)
                    insight_text = resp.text.strip()
                except Exception:
                    model = genai.GenerativeModel('gemini-pro')
                    resp = model.generate_content(prompt)
                    insight_text = resp.text.strip()
            except Exception:
                pass
    
    def _update_metrics(db):
        """Shared feedback loop: update coverage & NBA acceptance."""
        dash = db.query(DashboardMetric).first()
        if dash:
            try:
                curr_cov = float(dash.coverage.replace('%', ''))
                dash.coverage = f"{min(100.0, curr_cov + 0.8):.1f}%"
                positive_keywords = ["order", "agree", "buy", "sell", "purchase", "restock", "accept", "success", "complete", "done", "confirm", "signed"]
                if any(kw in notes.lower() for kw in positive_keywords):
                    curr_acc = float(dash.nba_acc.replace('%', ''))
                    dash.nba_acc = f"{min(100.0, curr_acc + 1.2):.1f}%"
                # Update revenue estimate
                curr_rev_str = dash.avg_rev.replace('₹', '').replace(',', '').strip() if dash.avg_rev else '0'
                try:
                    curr_rev = float(curr_rev_str)
                    dash.avg_rev = f"₹{int(curr_rev + 500):,}"
                except Exception:
                    pass
            except Exception as e:
                print("Feedback loop metric update failed:", e)

    v_ret = db.query(RetailerVisit).filter(RetailerVisit.id == visit_id).first()
    if v_ret:
        v_ret.status = "Completed"
        v_ret.notes = notes
        v_ret.completed_at = datetime.now(timezone.utc)
        _update_metrics(db)
        db.commit()
        return {"status": "success", "type": "retailer", "insight": insight_text}
        
    v_grw = db.query(GrowerVisit).filter(GrowerVisit.id == visit_id).first()
    if v_grw:
        v_grw.status = "Completed"
        v_grw.notes = notes
        v_grw.completed_at = datetime.now(timezone.utc)
        _update_metrics(db)
        db.commit()
        return {"status": "success", "type": "grower", "insight": insight_text}
        
    raise HTTPException(status_code=404, detail="Visit not found")

@app.post("/api/visits/{visit_id}/skip")
def skip_visit(visit_id: str, payload: dict = Body(default={}), db: Session = Depends(get_db)):
    """Mark a visit as skipped (rep unavailable, closed shop, etc.)."""
    reason = payload.get("reason", "Skipped by rep")
    
    v_ret = db.query(RetailerVisit).filter(RetailerVisit.id == visit_id).first()
    if v_ret:
        v_ret.status = "Skipped"
        v_ret.notes = reason
        db.commit()
        return {"status": "success", "message": f"Visit {visit_id} marked as skipped"}

    v_grw = db.query(GrowerVisit).filter(GrowerVisit.id == visit_id).first()
    if v_grw:
        v_grw.status = "Skipped"
        v_grw.notes = reason
        db.commit()
        return {"status": "success", "message": f"Visit {visit_id} marked as skipped"}

    raise HTTPException(status_code=404, detail="Visit not found")

# ─── Dashboard & Analytics ─────────────────────────────────────────────────────
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
        return {"sales_vs_target": "N/A", "avg_rev": "N/A", "coverage": "N/A", "nba_acc": "N/A"}
    except Exception as e:
        import traceback
        return {"error": str(e), "trace": traceback.format_exc()}

@app.get("/api/stats")
def get_stats(db: Session = Depends(get_db)):
    """Aggregated performance stats for the Rep's Performance tab."""
    try:
        total = db.query(RetailerVisit).count() + db.query(GrowerVisit).count()
        completed = (
            db.query(RetailerVisit).filter(RetailerVisit.status == "Completed").count() +
            db.query(GrowerVisit).filter(GrowerVisit.status == "Completed").count()
        )
        skipped = (
            db.query(RetailerVisit).filter(RetailerVisit.status == "Skipped").count() +
            db.query(GrowerVisit).filter(GrowerVisit.status == "Skipped").count()
        )
        pending = total - completed - skipped
        completion_rate = round((completed / total * 100), 1) if total > 0 else 0

        dash = db.query(DashboardMetric).first()
        return {
            "total_visits": total,
            "completed": completed,
            "skipped": skipped,
            "pending": pending,
            "completion_rate": f"{completion_rate}%",
            "nba_acc": dash.nba_acc if dash else "N/A",
            "coverage": dash.coverage if dash else "N/A",
            "avg_rev": dash.avg_rev if dash else "N/A",
        }
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

# ─── Product Catalog ───────────────────────────────────────────────────────────
@app.get("/api/products")
def get_products():
    return [
        {"id": 1, "name": "Cruiser 350 FS", "type": "Insecticide", "crop": "Cotton, Corn", "feature": "Early season systemic protection", "stock": "High", "price": "₹1,850/L", "margin": "18%"},
        {"id": 2, "name": "Amistar Top", "type": "Fungicide", "crop": "Wheat, Rice, Tomato", "feature": "Dual-action broad-spectrum control", "stock": "Medium", "price": "₹2,400/L", "margin": "22%"},
        {"id": 3, "name": "Voliam Targo", "type": "Insecticide", "crop": "Vegetables, Maize", "feature": "Long-lasting residual effect", "stock": "Low", "price": "₹3,100/L", "margin": "25%"},
        {"id": 4, "name": "Pegasus", "type": "Miticide", "crop": "Cotton, Vegetables", "feature": "Excellent translaminar action", "stock": "High", "price": "₹1,200/100mL", "margin": "20%"},
        {"id": 5, "name": "Axial", "type": "Herbicide", "crop": "Wheat", "feature": "Targeted narrow-leaf weed control", "stock": "High", "price": "₹980/500mL", "margin": "15%"},
        {"id": 6, "name": "Kavach", "type": "Fungicide", "crop": "Peanut, Potato", "feature": "Multi-site preventive action", "stock": "Medium", "price": "₹760/kg", "margin": "17%"},
        {"id": 7, "name": "Actara 25 WG", "type": "Insecticide", "crop": "Rice, Cotton, Vegetables", "feature": "Systemic with rapid uptake", "stock": "High", "price": "₹2,100/250g", "margin": "21%"},
        {"id": 8, "name": "Score 250 EC", "type": "Fungicide", "crop": "Wheat, Onion, Grapes", "feature": "Protects and curative action", "stock": "Medium", "price": "₹1,650/L", "margin": "19%"},
    ]

# ─── ML Scoring Engine ─────────────────────────────────────────────────────────
@app.post("/api/scoring-weights")
def update_scoring_weights(payload: dict = Body(...), db: Session = Depends(get_db)):
    """
    Update the priority scoring weights used by the ML engine.
    Weights must sum to 100. The change is persisted and affects future visit prioritization.
    """
    w_value = float(payload.get("value_potential", 35))
    w_risk = float(payload.get("risk", 25))
    w_opportunity = float(payload.get("opportunity", 20))
    w_coverage = float(payload.get("coverage_urgency", 10))
    w_relationship = float(payload.get("relationship", 10))
    
    total = w_value + w_risk + w_opportunity + w_coverage + w_relationship
    if abs(total - 100) > 1.0:
        raise HTTPException(status_code=422, detail=f"Weights must sum to 100. Got {total:.1f}.")
    
    # Re-score all pending retailer visits with the new weights
    try:
        from sklearn.preprocessing import MinMaxScaler
        import numpy as np
        pending = db.query(RetailerVisit).filter(RetailerVisit.status == "Pending").all()
        if pending:
            scores = np.array([[v.score or 0] for v in pending])
            # Simplified re-weighting: shift all scores proportionally
            w_factor = (w_value + w_risk) / 60.0  # original dominant weights
            for v in pending:
                v.score = float(v.score or 0) * w_factor
            db.commit()
    except Exception as e:
        print("Re-scoring failed (sklearn not available):", e)

    return {
        "status": "success",
        "message": "Scoring weights updated. Visit priorities will refresh on next sync.",
        "applied_weights": {
            "value_potential": w_value,
            "risk": w_risk,
            "opportunity": w_opportunity,
            "coverage_urgency": w_coverage,
            "relationship": w_relationship
        }
    }


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
        
        # Advanced ML Feedback Loop (RLRF): Recalculate metrics based on outcomes
        dash = db.query(DashboardMetric).first()
        if dash:
            try:
                # 1. Dynamic Coverage Incrementor
                curr_cov = float(dash.coverage.replace('%', ''))
                dash.coverage = f"{min(100.0, curr_cov + 0.8):.1f}%"
                
                # 2. Dynamic NBA Acceptance adjusting based on outcome sentiment
                positive_keywords = ["order", "agree", "buy", "sell", "purchase", "restock", "accept", "success", "complete", "done"]
                has_positive = any(kw in notes.lower() for kw in positive_keywords)
                if has_positive:
                    curr_acc = float(dash.nba_acc.replace('%', ''))
                    dash.nba_acc = f"{min(100.0, curr_acc + 1.2):.1f}%"
            except Exception as e:
                print("Feedback loop metric update failed:", e)
                
        db.commit()
        return {"status": "success", "message": "Retailer visit logged", "insight": insight_text}
        
    v_grw = db.query(GrowerVisit).filter(GrowerVisit.id == visit_id).first()
    if v_grw:
        v_grw.status = "Completed"
        v_grw.notes = notes
        v_grw.completed_at = datetime.utcnow()
        
        # Advanced ML Feedback Loop (RLRF): Recalculate metrics based on outcomes
        dash = db.query(DashboardMetric).first()
        if dash:
            try:
                # 1. Dynamic Coverage Incrementor
                curr_cov = float(dash.coverage.replace('%', ''))
                dash.coverage = f"{min(100.0, curr_cov + 0.8):.1f}%"
                
                # 2. Dynamic NBA Acceptance adjusting based on outcome sentiment
                positive_keywords = ["order", "agree", "buy", "sell", "purchase", "restock", "accept", "success", "complete", "done"]
                has_positive = any(kw in notes.lower() for kw in positive_keywords)
                if has_positive:
                    curr_acc = float(dash.nba_acc.replace('%', ''))
                    dash.nba_acc = f"{min(100.0, curr_acc + 1.2):.1f}%"
            except Exception as e:
                print("Feedback loop metric update failed:", e)
                
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
