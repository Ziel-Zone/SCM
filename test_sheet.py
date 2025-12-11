import gspread
from oauth2client.service_account import ServiceAccountCredentials

# 1. Setup Koneksi
scope = ["https://spreadsheets.google.com/feeds", "https://www.googleapis.com/auth/drive"]
creds = ServiceAccountCredentials.from_json_keyfile_name("credentials.json", scope)
client = gspread.authorize(creds)

# 2. Buka Spreadsheet
# Ganti dengan NAMA PERSIS file Google Sheet Anda
nama_sheet = "Data_Barang" 
sheet = client.open(nama_sheet).sheet1

# 3. Coba tarik data
data = sheet.get_all_records()

print("Berhasil konek! Ini datanya:")
print(data)