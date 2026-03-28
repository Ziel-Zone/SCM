import os
import enum
import csv
import io
from sqlalchemy.sql import func
from sqlalchemy import extract
from flask import Flask, render_template, request, redirect, url_for, flash, jsonify
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

basedir = os.path.abspath(os.path.dirname(__file__))

app = Flask(__name__)
app.secret_key = 'kunci_rahasia_pa_wawan_bebas_aja'
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///' + os.path.join(basedir, 'app.db')
db = SQLAlchemy(app)

# Inject semua barang ke template
@app.context_processor
def inject_products():
    try:
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
    role = db.Column(db.Enum(RoleEnum), nullable=False, default=RoleEnum.staf)
    created_at = db.Column(db.DateTime(timezone=True), server_default=func.now())
    updated_at = db.Column(db.DateTime(timezone=True), onupdate=func.now())

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
    created_at = db.Column(db.DateTime(timezone=True), server_default=func.now())
    updated_at = db.Column(db.DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

class Transaction(db.Model):
    __tablename__='transactions'
    id = db.Column(db.Integer, primary_key=True)
    product_id = db.Column(db.Integer, db.ForeignKey('products.id'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    tipe = db.Column(db.Enum('masuk', 'keluar'), nullable=False)
    jumlah   = db.Column(db.Integer, nullable=False)
    keterangan = db.Column(db.Text, nullable=True)
    tanggal_transaksi = db.Column(db.DateTime(timezone=True), server_default=func.now())

@app.route('/')
def dashboard():
    user_sekarang=User.query.get(1) 
    barang_restock = Product.query.filter(Product.stok <= Product.stock_minimum).all()
    semua_barang = Product.query.order_by(Product.nama_barang).all()
    return render_template(
        'dashboard.html',
        user=user_sekarang,
        daftar_restock=barang_restock,
        list_semua_barang=semua_barang
    )

@app.route('/transaksi/baru', methods=['POST'])
def tambah_transaksi():
    data = request.json
    try:
        product_id = int(data.get('product_id'))
        jumlah = int(data.get('jumlah'))
        tipe = data.get('tipe')
        keterangan = data.get('keterangan')
        user_id = 1 
        
        barang = Product.query.get(product_id)
        if not barang:
            return jsonify({'error': 'Barang tidak ditemukan'}), 404

        if tipe == 'masuk':
            barang.stok += jumlah
        elif tipe == 'keluar':
            if barang.stok < jumlah:
                return jsonify({'error': 'Stok tidak cukup'}), 400
            barang.stok -= jumlah
        
        transaksi_baru = Transaction(
            product_id=product_id, user_id=user_id, tipe=tipe,
            jumlah=jumlah, keterangan=keterangan
        )
        db.session.add(transaksi_baru)
        db.session.commit()

        return jsonify({'message': 'Transaksi berhasil!', 'stok_baru': barang.stok}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@app.route('/produk/baru', methods=['POST'])
def tambah_produk():
    data = request.json
    try:
        nama = data.get('nama_barang')
        satuan = data.get('satuan')
        kategori = data.get('kategori')
        try:
            stock_min = int(data.get('stock_minimum'))
        except:
            stock_min = 0
            
        produk_baru = Product(
            nama_barang=nama, satuan=satuan, kategori=kategori,
            stock_minimum=stock_min, stok=0, created_by=1
        )
        db.session.add(produk_baru)
        db.session.commit()
            
        return jsonify({'message': f'Produk "{nama}" berhasil ditambahkan!'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@app.route('/daftar-barang')
def daftar_barang():
    return render_template('daftar-barang.html')

@app.route('/laporan')
def laporan():
    tahun_sekarang = datetime.now().year
    bulan_sekarang = datetime.now().month
    
    daftar_tahun = [tahun_sekarang - i for i in range(5)]
    tahun_filter = request.args.get('tahun', type=int, default=tahun_sekarang)
    bulan_filter = request.args.get('bulan', type=int, default=bulan_sekarang)

    transaksi_list = Transaction.query.filter(
        extract('month', Transaction.tanggal_transaksi) == bulan_filter,
        extract('year', Transaction.tanggal_transaksi) == tahun_filter
    ).all()

    rekap = {}
    semua_produk = Product.query.all()
    for p in semua_produk:
        rekap[p.id] = {
            'nama': p.nama_barang, 'stok_akhir': p.stok, 
            'masuk': 0, 'keluar': 0
        }

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

    for pid, data in rekap.items():
        data['stok_awal'] = data['stok_akhir'] - data['masuk'] + data['keluar']

    laporan_data = list(rekap.values())

    item_terbanyak_keluar = "-"
    max_keluar = 0
    for data in laporan_data:
        if data['keluar'] > max_keluar:
            max_keluar = data['keluar']
            item_terbanyak_keluar = data['nama']

    return render_template(
        'laporan.html', laporan=laporan_data, bulan=bulan_filter,
        tahun=tahun_filter, daftar_tahun=daftar_tahun, 
        total_masuk=total_masuk_semua, total_keluar=total_keluar_semua,
        top_item=item_terbanyak_keluar
    )

@app.route('/produk/edit/<int:id>', methods=['PUT'])
def edit_produk(id):
    data = request.json
    try:
        barang = Product.query.get(id)
        if not barang:
            return jsonify({'error': 'Barang tidak ditemukan'}), 404
            
        barang.nama_barang = data.get('nama_barang')
        barang.satuan = data.get('satuan')
        barang.kategori = data.get('kategori')
        barang.stock_minimum = int(data.get('stock_minimum'))
        
        db.session.commit()
        return jsonify({'message': 'Data barang berhasil diupdate!'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

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
        return jsonify({'error': 'Gagal menghapus: Barang mungkin sudah memiliki riwayat transaksi.'}), 500

# RUTE BARU: IMPORT CSV
@app.route('/import-csv', methods=['POST'])
def import_csv():
    if 'file_csv' not in request.files:
        flash('Tidak ada file yang diunggah.', 'error')
        return redirect(url_for('daftar_barang'))
        
    file = request.files['file_csv']
    if file.filename == '':
        flash('File tidak valid.', 'error')
        return redirect(url_for('daftar_barang'))

    if not file.filename.endswith('.csv'):
        flash('Format file harus .csv', 'error')
        return redirect(url_for('daftar_barang'))

    try:
        stream = io.StringIO(file.stream.read().decode("UTF8"), newline=None)
        csv_input = csv.DictReader(stream)
        
        items_added = 0
        items_updated = 0
        
        for row in csv_input:
            # Mengamankan header (bisa Nama Barang, nama_barang, dll)
            nama_barang = row.get('Nama Barang') or row.get('nama_barang')
            if not nama_barang: continue
                
            satuan = row.get('Satuan') or row.get('satuan') or 'pcs'
            kategori = row.get('Kategori') or row.get('kategori') or '-'
            
            try:
                min_stok = int(row.get('Stok Minimum') or row.get('stok_minimum') or 0)
            except:
                min_stok = 0

            existing_product = Product.query.filter_by(nama_barang=nama_barang).first()
            
            if not existing_product:
                new_product = Product(
                    nama_barang=nama_barang, satuan=satuan, kategori=kategori,
                    stock_minimum=min_stok, stok=0, created_by=1
                )
                db.session.add(new_product)
                items_added += 1
            else:
                existing_product.satuan = satuan
                existing_product.kategori = kategori
                existing_product.stock_minimum = min_stok
                items_updated += 1

        db.session.commit()
        flash(f'Sukses! {items_added} barang baru dan {items_updated} barang diupdate dari CSV.', 'success')
        
    except Exception as e:
        db.session.rollback()
        flash(f'Gagal memproses CSV: {str(e)}', 'error')
        
    return redirect(url_for('daftar_barang'))