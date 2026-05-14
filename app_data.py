import pandas as pd
import os
import streamlit as st

DATA_DIR = os.path.join(os.path.dirname(__file__), "data")

@st.cache_data
def load_data():
    """Load and cache the data for the Streamlit app."""
    data = {}
    csv_files = {
        'reps': "reps_territory.csv",
        'retailers': "retailers.csv",
        'visit_logs': "retailer_visit_log.csv",
        'pos': "retailer_pos.csv",
        'inventory': "retailer_inventory_weekly.csv",
        'growers': "growers.csv",
        'digital_funnel': "digital_funnel_weekly.csv",
        'whatsapp': "whatsapp_campaign.csv"
    }
    
    for key, filename in csv_files.items():
        path = os.path.join(DATA_DIR, filename)
        if os.path.exists(path):
            df = pd.read_csv(path)
            data[key] = df
        else:
            data[key] = pd.DataFrame() 
            
    return data
