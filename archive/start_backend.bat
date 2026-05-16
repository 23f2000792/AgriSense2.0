@echo off
echo Installing requirements...
pip install -r backend\requirements.txt

echo.
echo Initializing the Machine Learning Database...
python backend\init_db.py

echo.
echo Starting the FastAPI Server...
cd backend
uvicorn main:app --reload --port 8000
