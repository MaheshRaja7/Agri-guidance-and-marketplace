
import pandas as pd
try:
    df = pd.read_csv(r'c:\Users\smahe\Downloads\agriculture web project\Plant-Disease-Detection-main\disease_info.csv', encoding='cp1252') # common windows encoding
    print("disease_info.csv columns:", df.columns.tolist())
    print("First row:", df.iloc[0].to_dict())
except Exception as e:
    print("Error reading disease_info.csv:", e)

try:
    df_supp = pd.read_csv(r'c:\Users\smahe\Downloads\agriculture web project\Plant-Disease-Detection-main\supplement_info.csv', encoding='cp1252')
    print("supplement_info.csv columns:", df_supp.columns.tolist())
    print("First row:", df_supp.iloc[0].to_dict())
except Exception as e:
    print("Error reading supplement_info.csv:", e)
