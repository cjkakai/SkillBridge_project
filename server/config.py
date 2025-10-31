
import os
# Remote library imports
from flask import Flask
from flask_cors import CORS
from flask_migrate import Migrate
from flask_restful import Api, Resource
from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
from sqlalchemy import MetaData
from dotenv import load_dotenv

UPLOAD_FOLDER = 'server/uploads'
load_dotenv()

app= Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URI', 'sqlite:///app.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# Add static folder for serving uploaded images
app.config['UPLOAD_FOLDER_IMAGES'] = os.path.join(app.config['UPLOAD_FOLDER'], 'images')
if not os.path.exists(app.config['UPLOAD_FOLDER_IMAGES']):
    os.makedirs(app.config['UPLOAD_FOLDER_IMAGES'])

# Add folder for cover letters
app.config['UPLOAD_FOLDER_COVER_LETTERS'] = os.path.join(app.config['UPLOAD_FOLDER'], 'cover_letters')
if not os.path.exists(app.config['UPLOAD_FOLDER_COVER_LETTERS']):
    os.makedirs(app.config['UPLOAD_FOLDER_COVER_LETTERS'])
app.json.compact = False
app.secret_key = b'\xae\xf2\xe4\x92\xe2\x99\x94\xa6\x81\x1a\xbe\xe4)\xf5\xbd\x93'
app.config['SESSION_COOKIE_SAMESITE'] = 'None'
app.config['SESSION_COOKIE_SECURE'] = False
app.config['SESSION_COOKIE_HTTPONLY'] = True


metadata = MetaData(naming_convention={
    "fk": "fk_%(table_name)s_%(column_0_name)s_%(referred_table_name)s",
})
db = SQLAlchemy(metadata=metadata)

CORS(app, supports_credentials=True, origins=['http://localhost:5173', 'http://127.0.0.1:5173'])

migrate= Migrate(app,db)

db.init_app(app)

api=Api(app)

bcrypt= Bcrypt(app)