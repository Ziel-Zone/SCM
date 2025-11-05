import os
import enum
from sqlalchemy.sql import func
from flask import Flask, render_template
from flask_sqlalchemy import SQLAlchemy
from flask import request, redirect, url_for, flash

basedir = os.path.abspath(os.path.dirname(__file__))

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///' + os.path.join(basedir, 'app.db')
db = SQLAlchemy(app)

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
    return render_template('dashboard.html')