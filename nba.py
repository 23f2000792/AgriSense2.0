def generate_nba_retailer(retailer_data):
    """Generate Next Best Action for a retailer visit."""
    actions = []
    
    reason = retailer_data.get('top_reason', '')
    
    if 'Stock-Out Risk' in reason:
        actions.append({
            'product': 'Score 250 EC',
            'objective': 'Secure replenishment order',
            'roi': '₹15,000 Expected',
            'talking_points': ['Current stock is extremely low', 'Demand in nearby tehsils is spiking', 'Secure order to prevent lost sales'],
            'reasons': ['OOS_RISK', 'DEMAND_SPIKE']
        })
    elif 'Sales Upside' in reason:
        actions.append({
            'product': 'Amistar Top',
            'objective': 'Cross-sell opportunity',
            'roi': '₹22,000 Expected',
            'talking_points': ['Competitor volume is high here', 'Offer bundle deal with Actara', 'Show performance comparison'],
            'reasons': ['COMPETITOR_SWITCH', 'BUNDLE_OPPORTUNITY']
        })
    else:
        actions.append({
            'product': 'Actara 25 WG',
            'objective': 'Promote key SKU',
            'roi': '₹8,000 Expected',
            'talking_points': ['Discuss upcoming season', 'Check on previous product performance'],
            'reasons': ['ROUTINE_PROMO', 'SEASONAL_PUSH']
        })
        
    return actions

def generate_nba_grower(grower_data):
    """Generate Next Best Action for a grower visit."""
    actions = []
    stage = grower_data.get('current_crop_stage', '')
    
    if 'Flowering' in stage:
        actions.append({
            'product': 'Amistar Top',
            'objective': 'Disease protection',
            'roi': 'Protect 15% yield',
            'talking_points': ['Critical stage for fungal infection', 'Apply within 3 days', 'Check for early blight symptoms'],
            'reasons': ['CRITICAL_STAGE', 'WEATHER_ALERT']
        })
    else:
        actions.append({
            'product': 'Karate Zeon',
            'objective': 'Pest control',
            'roi': 'Protect 10% yield',
            'talking_points': ['Recent pest sightings in district', 'Preventative spray recommended'],
            'reasons': ['PEST_ALERT', 'PREVENTATIVE']
        })
        
    return actions
