
import pandas as pd
import json
import os

try:
    # Read disease_info
    df_disease = pd.read_csv(r'Plant-Disease-Detection-main/disease_info.csv', encoding='cp1252')
    # Read supplement_info
    df_supp = pd.read_csv(r'Plant-Disease-Detection-main/supplement_info.csv', encoding='cp1252')
    
    metadata = {}
    
    # Process disease_info
    # Expected columns: index, disease_name, description, Possible Steps, image_url
    # Note from previous output, columns might be slightly different.
    # Let's inspect first row to be sure, or just iterate.
    
    # We want a map of disease_name -> info
    for _, row in df_disease.iterrows():
        name = str(row.get('disease_name', '')).strip()
        if not name: continue
        
        metadata[name] = {
            'description': str(row.get('description', '')),
            'possible_steps': str(row.get('Possible Steps', '')),
            'image_url': str(row.get('image_url', ''))
        }
        
    # Process supplement_info
    # Expected columns: index, disease_name, symptom, treatment, prevention
    for _, row in df_supp.iterrows():
        name = str(row.get('disease_name', '')).strip()
        if not name: continue
        
        if name not in metadata:
            metadata[name] = {}
            
        metadata[name]['symptoms'] = str(row.get('symptom', '')) # check column name
        metadata[name]['treatment'] = str(row.get('treatment', ''))
        metadata[name]['prevention'] = str(row.get('prevention', ''))
        
    # Also scan test_images directory to get available classes from filenames
    test_images_dir = r"Plant-Disease-Detection-main/test_images"
    image_classes = []
    if os.path.exists(test_images_dir):
        files = os.listdir(test_images_dir)
        for f in files:
            if f.lower().endswith(('.jpg', '.jpeg', '.png')):
                # Filename format: ClassName.extension usually
                # But some are "Apple_ceder_apple_rust.JPG" -> "Apple_ceder_apple_rust"?
                # or "tomato_bacterial_spot.JPG"
                base_name = os.path.splitext(f)[0]
                image_classes.append(base_name)
    
    output = {
        "metadata": metadata,
        "image_classes": image_classes
    }
    
    with open('disease_metadata.json', 'w', encoding='utf-8') as f:
        json.dump(output, f, indent=2)
        
    print("Metadata extracted to disease_metadata.json")
    print(f"Found {len(metadata)} diseases in CSV.")
    print(f"Found {len(image_classes)} images in test_images.")

except Exception as e:
    print(f"Error: {e}")
