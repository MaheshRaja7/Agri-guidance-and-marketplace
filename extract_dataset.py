
import zipfile
import os

zip_path = r"c:\Users\smahe\Downloads\dataset.zip"
extract_path = r"c:\Users\smahe\Downloads\agriculture web project\dataset"

if not os.path.exists(extract_path):
    os.makedirs(extract_path)

try:
    with zipfile.ZipFile(zip_path, 'r') as zip_ref:
        zip_ref.extractall(extract_path)
    print("Extraction complete.")
except Exception as e:
    print(f"Error: {e}")
