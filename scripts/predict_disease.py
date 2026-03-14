import os
import json
import sys
import numpy as np
import tensorflow as tf
from tensorflow.keras.applications import MobileNetV2
from tensorflow.keras.applications.mobilenet_v2 import preprocess_input
from tensorflow.keras.preprocessing import image
from tensorflow.keras.models import Model

# Suppress TensorFlow logs
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '2'

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MODELS_DIR = os.path.join(BASE_DIR, 'models')
FEATURES_PATH = os.path.join(MODELS_DIR, 'features.npy')
LABELS_PATH = os.path.join(MODELS_DIR, 'labels.json')

def load_model_and_index():
    if not os.path.exists(FEATURES_PATH) or not os.path.exists(LABELS_PATH):
        raise FileNotFoundError("Index files not found. Run train_model.py first.")

    # Load MobileNetV2
    model = MobileNetV2(weights='imagenet', include_top=False, pooling='avg')
    
    # Load Index
    stored_features = np.load(FEATURES_PATH)
    with open(LABELS_PATH, 'r') as f:
        stored_labels = json.load(f)
        
    return model, stored_features, stored_labels

def predict_disease(image_path):
    try:
        model, stored_features, stored_labels = load_model_and_index()
        
        # 1. Process Input Image
        img = image.load_img(image_path, target_size=(224, 224))
        x = image.img_to_array(img)
        x = np.expand_dims(x, axis=0)
        x = preprocess_input(x)
        
        # 2. Extract Features
        new_features = model.predict(x, verbose=0)
        # Normalize
        new_features = new_features / np.linalg.norm(new_features)
        
        # 3. Compute Similarity (Cosine Similarity aka Dot Product for normalized vectors)
        # stored_features shape: (N, 1280)
        # new_features shape: (1, 1280)
        # similarities shape: (1, N) -> flatten to (N,)
        similarities = np.dot(stored_features, new_features.T).flatten()
        
        # 4. Find Best Match
        best_index = np.argmax(similarities)
        best_similarity = float(similarities[best_index])
        best_label = stored_labels[best_index]
        
        # Handle low confidence (if even the best match is poor)
        # 0.6 is a reasonable threshold for MobileNet features
        confidence_score = best_similarity
        
        # Optional: Get top 3
        top_indices = similarities.argsort()[-3:][::-1]
        top_predictions = {stored_labels[i]: float(similarities[i]) for i in top_indices}

        return {
            "diseaseName": best_label,
            "confidence": confidence_score,
            "predictions": top_predictions
        }

    except Exception as e:
        return {"error": str(e)}

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({"error": "No image path provided"}))
        sys.exit(1)

    image_path = sys.argv[1]
    result = predict_disease(image_path)
    print(json.dumps(result))
