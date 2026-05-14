import pandas as pd
import numpy as np

def score_retailers(retailer_features):
    """Calculates visit prioritization scores for retailers."""
    if retailer_features.empty:
        return pd.DataFrame()
        
    scored = retailer_features.copy()
    
    # 1. Value Potential
    max_sales = scored.get('total_units_sold', pd.Series([1])).max()
    max_sales = max_sales if max_sales > 0 else 1
    scored['score_value'] = scored.get('total_units_sold', 0) / max_sales
    
    # 2. Risk (Stock out risk)
    scored['score_risk'] = np.where(scored.get('days_of_cover', 100) < 14, 1.0, 0.2)
    
    # 3. Relationship
    np.random.seed(42) # For reproducible prototype
    scored['score_relationship'] = np.random.uniform(0.2, 0.8, size=len(scored))
    
    # Total Score
    weights = {'value': 0.4, 'risk': 0.4, 'relationship': 0.2}
    scored['priority_score'] = (
        scored['score_value'] * weights['value'] +
        scored['score_risk'] * weights['risk'] +
        scored['score_relationship'] * weights['relationship']
    )
    
    # Add some noise to prevent identical scores
    scored['priority_score'] += np.random.normal(0, 0.05, size=len(scored))
    
    # Priority Band
    try:
        scored['priority_band'] = pd.qcut(scored['priority_score'], q=3, labels=['Low', 'Medium', 'High'])
    except:
        scored['priority_band'] = 'Medium'
    
    # Reasons
    scored['top_reason'] = np.where(
        scored['score_risk'] > 0.8, 'High Stock-Out Risk',
        np.where(scored['score_value'] > 0.7, 'High Sales Upside', 'Relationship Update')
    )
    
    return scored.sort_values('priority_score', ascending=False)

def score_growers(grower_features):
    """Calculates visit prioritization scores for growers."""
    if grower_features.empty:
        return pd.DataFrame()
        
    scored = grower_features.copy()
    
    np.random.seed(43)
    scored['score_value'] = np.random.uniform(0, 1, size=len(scored))
    scored['score_opportunity'] = scored.get('engagement_score', 0.5)
    
    scored['priority_score'] = (scored['score_value'] * 0.5) + (scored['score_opportunity'] * 0.5)
    
    try:
        scored['priority_band'] = pd.qcut(scored['priority_score'], q=3, labels=['Low', 'Medium', 'High'])
    except:
        scored['priority_band'] = 'Medium'
        
    scored['top_reason'] = np.where(
        scored.get('current_crop_stage', '') == 'Flowering', 'Critical Stage - Flowering',
        np.where(scored['score_opportunity'] > 0.7, 'High Digital Engagement', 'Routine check-in')
    )
    
    return scored.sort_values('priority_score', ascending=False)
