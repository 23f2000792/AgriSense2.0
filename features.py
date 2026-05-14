import pandas as pd
import numpy as np

def generate_retailer_features(data):
    """Generates daily features for retailers."""
    retailers = data.get('retailers', pd.DataFrame())
    pos = data.get('pos', pd.DataFrame())
    inventory = data.get('inventory', pd.DataFrame())
    
    if retailers.empty:
        return pd.DataFrame()
        
    features = retailers.copy()
    
    # 1. POS Dynamics (prototype aggregates)
    if not pos.empty and 'sku_qty' in pos.columns:
        pos_agg = pos.groupby('retailer_id').agg(
            total_units_sold=('sku_qty', 'sum')
        ).reset_index()
        features = features.merge(pos_agg, on='retailer_id', how='left')
    else:
        features['total_units_sold'] = np.random.randint(10, 500, size=len(features))
        
    # 2. Inventory Health
    if not inventory.empty and 'sku_qty' in inventory.columns:
        inv_agg = inventory.groupby('retailer_id').agg(
            current_stock=('sku_qty', 'sum')
        ).reset_index()
        features = features.merge(inv_agg, on='retailer_id', how='left')
    else:
        features['current_stock'] = np.random.randint(0, 1000, size=len(features))
        
    # Dummy days of cover
    features['days_of_cover'] = features.get('current_stock', 100) / (features.get('total_units_sold', 10) / 30 + 1)
    
    # Fill NAs
    features.fillna(0, inplace=True)
    return features

def generate_grower_features(data):
    """Generates daily features for growers."""
    growers = data.get('growers', pd.DataFrame())
    if growers.empty:
        return pd.DataFrame()
        
    features = growers.copy()
    
    # Add engagement score
    features['engagement_score'] = np.random.uniform(0, 1, size=len(features))
    
    # Add random crop stage for prototype
    stages = ['Pre-emergence', 'Vegetative', 'Flowering', 'Pod formation', 'Harvest']
    features['current_crop_stage'] = np.random.choice(stages, size=len(features))
    
    return features
