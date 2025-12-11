import os
import enum
from sqlalchemy.sql import func
from sqlalchemy import extract
from flask import Flask, render_template
from flask_sqlalchemy import SQLAlchemy
from flask import request, redirect, url_for, flash, jsonify


basedir = os.path.abspath(os.path.dirname(__file__))

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///' + os.path.join(basedir, 'app.db')
db = SQLAlchemy(app)

# app.py

# Ini akan membuat 'list_semua_barang' tersedia di SEMUA template (layout, dashboard, dll)
@app.context_processor
def inject_products():
    try:
        # Ambil semua produk
        products = Product.query.order_by(Product.nama_barang).all()
        return dict(list_semua_barang=products)
    except:
        return dict(list_semua_barang=[])

class RoleEnum(enum.Enum):
    admin  = 'admin'
    staf = 'staf'


class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    nama_lengkap = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    role = db.Column(
        db.Enum(RoleEnum), 
        nullable=False, 
        default=RoleEnum.staf
    )
    created_at = db.Column(
        db.DateTime(timezone=True),
        server_default=func.now()
    )
    updated_at = db.Column(
        db.DateTime(timezone=True),
        onupdate=func.now()
    )
    def __repr__(self):
        return f'<User {self.nama_lengkap}>'
    
class Product(db.Model):
    __tablename__ = 'products'
    id = db.Column(db.Integer, primary_key=True)
    nama_barang = db.Column(db.String(255), nullable=False)
    sku = db.Column(db.String(100), unique=True, nullable=True)
    satuan= db.Column(db.String(50), nullable=False)
    kategori = db.Column(db.String(100), nullable=True)
    stok = db.Column(db.Integer, nullable=False, default=0)
    stock_minimum = db.Column(db.Integer, nullable=True,default=0)
    deskripsi = db.Column(db.Text, nullable=True)

    created_by = db.Column(db.Integer, db.ForeignKey('users.id'))
    created_at = db.Column(
        db.DateTime(timezone=True),
        server_default=func.now()
    )
    updated_at = db.Column(
        db.DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now()
    )

    def __repr__(self):
        return f'<Product {self.nama_barang}>'

    
class Transaction(db.Model):
    __tablename__='transactions'
    id = db.Column(db.Integer, primary_key=True)
    product_id = db.Column(db.Integer, db.ForeignKey('products.id'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    
    tipe = db.Column(
        db.Enum('masuk', 'keluar'),
        nullable=False
    )
    jumlah   = db.Column(db.Integer, nullable=False)
    keterangan = db.Column(db.Text, nullable=True)
    tanggal_transaksi = db.Column(
        db.DateTime(timezone=True),
        server_default=func.now()
    )
    def __repr__(self):
        return f'<Transaction {self.id} - {self.tipe}>'
    
@app.route('/')
def dashboard():
    user_sekarang=User.query.get(1)  # Contoh: ambil user dengan ID 1
    barang_restock=Product.query.limit(5).all()  # Contoh: ambil 5 barang pertama
    barang_restock = Product.query.filter(
        Product.stok <= Product.stock_minimum
    ).all()
    

    semua_barang = Product.query.order_by(Product.nama_barang).all()
    return render_template(
        'dashboard.html',
        user=user_sekarang,
        daftar_restock=barang_restock,
        list_semua_barang=semua_barang
    )

@app.route('/transaksi/baru', methods=['POST'])
def tambah_transaksi():
    # ambil data dari form
    data = request.json

    try:
        product_id = int(data.get('product_id'))
        jumlah = int(data.get('jumlah'))
        tipe = data.get('tipe')
        keterangan = data.get('keterangan')
        user_id = 1  # Ganti dengan user yang sedang login
        
        barang = Product.query.get(product_id)

        if not barang:
            return jsonify({'status': 'error', 'message': 'Barang tidak ditemukan'}), 404

        if tipe == 'masuk':
            barang.stok += jumlah
        elif tipe == 'keluar':
            if barang.stok < jumlah:
                return jsonify({'error': f'Stok {barang.nama_barang}tidak mencukupi'}), 400
            barang.stok = barang.stok - jumlah
        
        transaksi_baru = Transaction(
            product_id=product_id,
            user_id=user_id,
            tipe=tipe,
            jumlah=jumlah,
            keterangan=keterangan
        )
        db.session.add(transaksi_baru)
        db.session.commit()

        return jsonify({
            'message' : 'Transaksi berhasil ditambahkan',
            'stok_sekarang': barang.stok
        }), 200
    
    except Exception as e:
        db.session.rollback()
        return jsonify({'status': 'error', 'message': str(e)}), 500

@app.route('/produk/baru', methods=['POST'])
def tambah_product():
    data = request.json
    try:
        produk_baru = Product(
            nama_barang = data.get('nama_barang'),
            satuan = data.get('satuan'),
            kategori = data.get('kategori'),
            stock_minimum = int(data.get('stock_minimum')) if data.get('stock_minimum') not in (None, '') else 0,
            stok = int(data.get('stok')) if data.get('stok') not in (None, '') else 0,
            created_by = 1  # Ganti dengan user yang sedang login
        )
        db.session.add(produk_baru)
        db.session.commit()

        return jsonify({
            'message': f'Produk "{produk_baru.nama_barang}" berhasil ditambahkan!'
        }), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({'status': 'error', 'message': str(e)}), 500



@app.route('/daftar-barang')
def daftar_barang():
    # (Logika ambil barang Anda)
    return render_template('daftar-barang.html')

# app.py

@app.route('/laporan')
def laporan():
    # 1. Ambil filter dari URL (Query String)
    # Default ke bulan/tahun sekarang jika tidak ada
    import datetime
    sekarang = datetime.datetime.now()
    
    bulan_filter = request.args.get('bulan', type=int, default=sekarang.month)
    tahun_filter = request.args.get('tahun', type=int, default=sekarang.year)

    # 2. Ambil semua Transaksi pada bulan/tahun tersebut
    transaksi_list = Transaction.query.filter(
        extract('month', Transaction.tanggal_transaksi) == bulan_filter,
        extract('year', Transaction.tanggal_transaksi) == tahun_filter
    ).all()

    # 3. Hitung Rekapitulasi per Barang (Algoritma Python Manual)
    # Kita butuh dict: { id_barang: { 'nama': ..., 'masuk': 0, 'keluar': 0 } }
    rekap = {}
    
    # Inisialisasi rekap dengan semua produk (biar yg ga ada transaksi tetap muncul)
    semua_produk = Product.query.all()
    for p in semua_produk:
        rekap[p.id] = {
            'nama': p.nama_barang,
            'stok_akhir': p.stok, # Stok real-time saat ini
            'masuk': 0,
            'keluar': 0
        }

    # Loop transaksi untuk hitung masuk/keluar
    total_masuk_semua = 0
    total_keluar_semua = 0
    
    for t in transaksi_list:
        if t.product_id in rekap:
            if t.tipe == 'masuk':
                rekap[t.product_id]['masuk'] += t.jumlah
                total_masuk_semua += t.jumlah
            elif t.tipe == 'keluar':
                rekap[t.product_id]['keluar'] += t.jumlah
                total_keluar_semua += t.jumlah

    # Hitung "Stok Awal" (Reverse Engineering)
    # Stok Awal = Stok Akhir - Masuk + Keluar
    for pid, data in rekap.items():
        data['stok_awal'] = data['stok_akhir'] - data['masuk'] + data['keluar']

    # Konversi ke list untuk dikirim ke template
    laporan_data = list(rekap.values())

    # Cari Item Terbanyak Keluar
    item_terbanyak_keluar = "-"
    max_keluar = 0
    for data in laporan_data:
        if data['keluar'] > max_keluar:
            max_keluar = data['keluar']
            item_terbanyak_keluar = data['nama']

    # 4. Kirim ke Template
    return render_template(
        'laporan.html',
        laporan=laporan_data,
        bulan=bulan_filter,
        tahun=tahun_filter,
        total_masuk=total_masuk_semua,
        total_keluar=total_keluar_semua,
        top_item=item_terbanyak_keluar
    )

# 1. RUTE UPDATE BARANG
@app.route('/produk/edit/<int:id>', methods=['PUT'])
def edit_produk(id):
    data = request.json
    try:
        barang = Product.query.get(id)
        if not barang:
            return jsonify({'error': 'Barang tidak ditemukan'}), 404
            
        # Update data
        barang.nama_barang = data.get('nama_barang')
        barang.satuan = data.get('satuan')
        barang.kategori = data.get('kategori')
        barang.stock_minimum = int(data.get('stock_minimum'))
        
        db.session.commit()
        return jsonify({'message': 'Data barang berhasil diupdate!'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

# 2. RUTE HAPUS BARANG
@app.route('/produk/hapus/<int:id>', methods=['DELETE'])
def hapus_produk(id):
    try:
        barang = Product.query.get(id)
        if not barang:
            return jsonify({'error': 'Barang tidak ditemukan'}), 404
            
        db.session.delete(barang)
        db.session.commit()
        return jsonify({'message': 'Barang berhasil dihapus!'}), 200
    except Exception as e:
        # Error biasanya terjadi jika barang sudah pernah dipakai di transaksi (Foreign Key)
        return jsonify({'error': 'Gagal menghapus: Barang mungkin sudah memiliki riwayat transaksi.'}), 500

