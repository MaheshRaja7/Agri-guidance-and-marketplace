import os
import io
import json
import numpy as np
import tensorflow as tf
from PIL import Image
from flask import Flask, request, jsonify
from flask_cors import CORS
from tensorflow.keras.applications import MobileNetV2
from tensorflow.keras.applications.mobilenet_v2 import preprocess_input
from tensorflow.keras.preprocessing import image

# Suppress TensorFlow logs
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '2'

app = Flask(__name__)
CORS(app)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODELS_DIR = os.path.join(BASE_DIR, 'models')
FEATURES_PATH = os.path.join(MODELS_DIR, 'features.npy')
LABELS_PATH = os.path.join(MODELS_DIR, 'labels.json')

def load_model_and_index():
    if not os.path.exists(FEATURES_PATH) or not os.path.exists(LABELS_PATH):
        raise FileNotFoundError("Index files not found.")

    model = MobileNetV2(weights='imagenet', include_top=False, pooling='avg')
    stored_features = np.load(FEATURES_PATH)
    with open(LABELS_PATH, 'r') as f:
        stored_labels = json.load(f)
        
    return model, stored_features, stored_labels

try:
    print("Loading model and features...")
    model, stored_features, stored_labels = load_model_and_index()
    print("Model and features loaded successfully.")
except Exception as e:
    print(f"Error loading model: {e}")
    model = None

@app.route('/api/predict', methods=['POST'])
def predict():
    if model is None:
        return jsonify({"error": "Model not loaded on server."}), 500
        
    if 'image' not in request.files:
        return jsonify({"error": "No image provided."}), 400
        
    try:
        file = request.files['image']
        image_bytes = file.read()
        
        img = Image.open(io.BytesIO(image_bytes))
        if img.mode != "RGB":
            img = img.convert("RGB")
        img = img.resize((224, 224))
        
        x = image.img_to_array(img)
        x = np.expand_dims(x, axis=0)
        x = preprocess_input(x)
        
        new_features = model.predict(x, verbose=0)
        new_features = new_features / np.linalg.norm(new_features)
        
        similarities = np.dot(stored_features, new_features.T).flatten()
        
        best_index = np.argmax(similarities)
        best_similarity = float(similarities[best_index])
        best_label = stored_labels[best_index]
        
        return jsonify({
            "diseaseName": best_label,
            "confidence": best_similarity
        })
        
    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=False)
