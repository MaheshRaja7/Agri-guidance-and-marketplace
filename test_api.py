
import requests
import os

url = "http://localhost:5000/api/predict"
image_path = r"c:\Users\smahe\Downloads\agriculture web project\dataset\dataset\train\heavy\heavy_weed_1.jpg"

if not os.path.exists(image_path):
    print(f"Error: Image not found at {image_path}")
    exit(1)

try:
    with open(image_path, 'rb') as img:
        files = {'image': img}
        print(f"Sending request to {url}...")
        response = requests.post(url, files=files)
    
    print(f"Status Code: {response.status_code}")
    print("Response JSON:")
    print(response.json())
except Exception as e:
    print(f"Error: {e}")
