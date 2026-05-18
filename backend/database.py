from sqlalchemy import create_engine, Column, Integer, String, Float, Boolean, Text, ForeignKey, DateTime
from sqlalchemy.orm import declarative_base, sessionmaker
from datetime import datetime

import os
import shutil

# Automatically detect Vercel environment (Serverless AWS Lambda)
is_vercel = any(os.environ.get(k) for k in ["VERCEL", "VERCEL_ENV", "VERCEL_URL", "AWS_EXECUTION_ENV", "AWS_LAMBDA_FUNCTION_NAME"])
backend_dir = os.path.dirname(os.path.abspath(__file__))
db_path = os.path.join(backend_dir, "agrisense.db")

if is_vercel:
    # Copy the committed DB to /tmp to allow read/write operations during the serverless lifecycle
    tmp_db_path = "/tmp/agrisense.db"
    if os.path.exists(db_path) and not os.path.exists(tmp_db_path):
        shutil.copy2(db_path, tmp_db_path)
    DATABASE_URL = f"sqlite:///{tmp_db_path}"
else:
    DATABASE_URL = f"sqlite:///{db_path}"

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

class RetailerVisit(Base):
    __tablename__ = "retailer_visits"

    id = Column(String, primary_key=True, index=True)
    name = Column(String, index=True)
    tehsil = Column(String)
    priority = Column(String) # High, Medium, Low
    reason = Column(String)
    sales30d = Column(String)
    daysCover = Column(Integer)
    score = Column(Float)
    
    # Next Best Action (Stored as JSON strings)
    nba_product = Column(String)
    nba_objective = Column(String)
    nba_roi = Column(String)
    nba_talkingPoints = Column(Text) # JSON list
    nba_tags = Column(Text) # JSON list

    # Dynamic status
    status = Column(String, default="Pending") # Pending, Completed, Skipped
    completed_at = Column(DateTime, nullable=True)
    notes = Column(Text, nullable=True)

class GrowerVisit(Base):
    __tablename__ = "grower_visits"

    id = Column(String, primary_key=True, index=True)
    name = Column(String, index=True)
    tehsil = Column(String)
    priority = Column(String)
    reason = Column(String)
    crop = Column(String)
    
    nba_product = Column(String)
    nba_objective = Column(String)
    nba_roi = Column(String)
    nba_talkingPoints = Column(Text)
    nba_tags = Column(Text)

    status = Column(String, default="Pending")
    completed_at = Column(DateTime, nullable=True)
    notes = Column(Text, nullable=True)

class Alert(Base):
    __tablename__ = "alerts"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    title = Column(String)
    severity = Column(String)
    desc = Column(Text)
    affected = Column(String)
    is_active = Column(Boolean, default=True)

class DashboardMetric(Base):
    __tablename__ = "dashboard_metrics"

    id = Column(Integer, primary_key=True, index=True)
    sales_vs_target = Column(String)
    avg_rev = Column(String)
    coverage = Column(String)
    nba_acc = Column(String)

Base.metadata.create_all(bind=engine)
