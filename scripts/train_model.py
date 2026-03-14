import os
import json
import numpy as np
import tensorflow as tf
from tensorflow.keras.applications import MobileNetV2
from tensorflow.keras.applications.mobilenet_v2 import preprocess_input
from tensorflow.keras.preprocessing import image
from tensorflow.keras.models import Model

# Set paths
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_DIR = os.path.join(BASE_DIR, 'Plant-Disease-Detection-main', 'test_images')
MODELS_DIR = os.path.join(BASE_DIR, 'models')

# Ensure models directory exists
os.makedirs(MODELS_DIR, exist_ok=True)

def extract_features_and_index():
    print("Loading MobileNetV2 for feature extraction...")
    # Load MobileNetV2 without the top classification layer
    # include_top=False, pooling='avg' gives us a 1D vector (1280 floats) for each image
    base_model = MobileNetV2(weights='imagenet', include_top=False, pooling='avg')

    files = [f for f in os.listdir(DATA_DIR) if f.lower().endswith(('.jpg', '.jpeg', '.png'))]
    
    if not files:
        print(f"No images found in {DATA_DIR}")
        return

    features_list = []
    labels_list = []
    filenames_list = []

    print(f"Processing {len(files)} images...")
    
    for file in files:
        img_path = os.path.join(DATA_DIR, file)
        
        try:
            # 1. Load and Preprocess
            img = image.load_img(img_path, target_size=(224, 224))
            x = image.img_to_array(img)
            x = np.expand_dims(x, axis=0)
            x = preprocess_input(x)

            # 2. Extract Features
            features = base_model.predict(x, verbose=0)
            
            # Normalize the feature vector (L2 norm)
            # This is crucial for Cosine Similarity later
            norm_features = features / np.linalg.norm(features)
            
            features_list.append(norm_features[0])
            
            # 3. Create Label
            # Assume filename format is label
            label = os.path.splitext(file)[0]
            label = label.replace('_', ' ').replace('-', ' ').strip()
            # Remove trailing numbers if any
            import re
            label = re.sub(r'\d+$', '', label).strip()
            
            labels_list.append(label)
            filenames_list.append(file)
            
            print(f"Indexed: {file} -> {label}")

        except Exception as e:
            print(f"Error processing {file}: {e}")

    # Convert to numpy arrays
    features_array = np.array(features_list)
    
    # Save everything
    np.save(os.path.join(MODELS_DIR, 'features.npy'), features_array)
    
    with open(os.path.join(MODELS_DIR, 'labels.json'), 'w') as f:
        json.dump(labels_list, f)

    with open(os.path.join(MODELS_DIR, 'filenames.json'), 'w') as f:
        json.dump(filenames_list, f)
        
    print("\n------------------------------------------------")
    print("Indexing Complete!")
    print(f"Indexed {len(features_list)} images.")
    print(f"Features saved to {os.path.join(MODELS_DIR, 'features.npy')}")
    print("------------------------------------------------")

if __name__ == "__main__":
    extract_features_and_index()
