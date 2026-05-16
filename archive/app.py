import streamlit as st
import pandas as pd
from datetime import datetime

from app_data import load_data
from features import generate_retailer_features, generate_grower_features
from prioritization import score_retailers, score_growers
from nba import generate_nba_retailer, generate_nba_grower

st.set_page_config(page_title="Syngenta Field Co-Pilot", page_icon="🌱", layout="wide")

# Modern styling
st.markdown("""
<style>
    .reportview-container {
        background: #f4f6f9;
    }
    .main .block-container {
        padding-top: 2rem;
    }
    div[data-testid="metric-container"] {
        background-color: #ffffff;
        border: 1px solid #e0e0e0;
        padding: 5% 5% 5% 10%;
        border-radius: 8px;
        box-shadow: 0 4px 6px rgba(0,0,0,0.05);
    }
    .chip {
        display: inline-block;
        padding: 4px 10px;
        border-radius: 16px;
        font-size: 12px;
        font-weight: 600;
        margin-right: 6px;
        margin-bottom: 6px;
    }
    .chip-high { background-color: #ffebee; color: #c62828; }
    .chip-medium { background-color: #fff3e0; color: #ef6c00; }
    .chip-low { background-color: #e8f5e9; color: #2e7d32; }
    .chip-reason { background-color: #e3f2fd; color: #1565c0; border: 1px solid #bbdefb; }
</style>
""", unsafe_allow_html=True)

@st.cache_data
def get_processed_data():
    data = load_data()
    r_feats = generate_retailer_features(data)
    g_feats = generate_grower_features(data)
    
    s_retailers = score_retailers(r_feats)
    s_growers = score_growers(g_feats)
    return s_retailers, s_growers

with st.spinner("Loading contextual intelligence..."):
    scored_retailers, scored_growers = get_processed_data()

st.title("🌱 Syngenta AI Field Co-Pilot")
st.markdown("Dynamic prioritization and Next-Best-Action recommendation engine.")

tab1, tab2 = st.tabs(["📱 Field Rep App", "📊 Manager Dashboard"])

with tab1:
    st.header(f"Today's Plan - {datetime.now().strftime('%b %d, %Y')}")
    st.markdown("**Territory:** IND-MH-01 (Pune District)")
    
    # KPI Cards
    col1, col2, col3 = st.columns(3)
    col1.metric("Planned Visits", "12", "On track")
    col2.metric("High-Priority Accounts", "7", "+2 from alerts", delta_color="off")
    col3.metric("Estimated Revenue", "₹85,000", "+12% vs avg")
    
    st.subheader("Visit Sequence")
    
    visit_type = st.radio("Filter by:", ["All", "Retailers", "Growers"], horizontal=True)
    
    if visit_type in ["All", "Retailers"] and not scored_retailers.empty:
        st.markdown("### 🏪 Retailer Visits")
        for idx, row in scored_retailers.head(5).iterrows():
            retailer_id = row.get('retailer_id', f'RET-{idx}')
            tehsil = row.get('tehsil', 'Pune Central')
            pri = row['priority_band']
            
            with st.expander(f"Retailer: {retailer_id} | {tehsil} | Priority: {pri}"):
                
                col_a, col_b = st.columns([1, 2])
                with col_a:
                    st.markdown("**Summary**")
                    st.markdown(f"- **Top Reason:** {row['top_reason']}")
                    st.markdown(f"- **Est. Sales (30d):** ₹{int(row.get('total_units_sold', 0)*150):,}")
                    st.markdown(f"- **Days of Cover:** {int(row.get('days_of_cover', 0))} days")
                
                with col_b:
                    st.markdown("**Next Best Actions**")
                    nba_list = generate_nba_retailer(row)
                    for action in nba_list:
                        st.info(f"🎯 **{action['product']}** - {action['objective']}  \n*(ROI: {action['roi']})*")
                        st.markdown("**Talking Points:**")
                        for tp in action['talking_points']:
                            st.markdown(f"- {tp}")
                        
                        reasons_html = " ".join([f"<span class='chip chip-reason'>{r}</span>" for r in action['reasons']])
                        st.markdown(reasons_html, unsafe_allow_html=True)
                
                st.button(f"Log Outcome", key=f"btn_ret_{idx}", use_container_width=True)

    if visit_type in ["All", "Growers"] and not scored_growers.empty:
        st.markdown("### 🚜 Grower Visits")
        for idx, row in scored_growers.head(3).iterrows():
            grower_id = row.get('grower_id', f'GRW-{idx}')
            stage = row.get('current_crop_stage', 'Unknown')
            pri = row['priority_band']
            
            with st.expander(f"Grower: {grower_id} | Crop Stage: {stage} | Priority: {pri}"):
                st.markdown(f"**Top Reason:** {row['top_reason']}")
                nba_list = generate_nba_grower(row)
                for action in nba_list:
                    st.success(f"🎯 **{action['product']}** - {action['objective']}")
                    st.markdown("**Advisory Points:**")
                    for tp in action['talking_points']:
                        st.markdown(f"- {tp}")
                st.button(f"Log Outcome", key=f"btn_grw_{idx}", use_container_width=True)

with tab2:
    st.header("Territory Overview")
    
    col1, col2, col3, col4 = st.columns(4)
    col1.metric("Sales vs Target", "92%", "+5%")
    col2.metric("Avg Rev per Day", "₹72,000", "+₹4,500")
    col3.metric("Coverage (High Pri)", "88%", "+3%")
    col4.metric("NBA Acceptance", "64%", "+8%")
    
    col_chart, col_alerts = st.columns([1, 1])
    
    with col_chart:
        st.subheader("Retailer Priority Distribution")
        if not scored_retailers.empty:
            band_counts = scored_retailers['priority_band'].value_counts()
            st.bar_chart(band_counts, color="#1f77b4")
            
    with col_alerts:
        st.subheader("🚨 Active Alerts")
        st.error("**Demand Spike:** High digital engagement for Actara in Pune tehsil but low POS conversion. Reprioritize nearby retailers.")
        st.warning("**Pest Risk:** Favorable conditions for early blight in Nashik; recommend Amistar Top to all growers in Vegetative/Flowering stage.")
        st.info("**Stock-out Risk:** 4 key retailers in Baramati running low on Score 250 EC. Urgent replenishment needed.")
