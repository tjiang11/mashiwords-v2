from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_triangle import Triangle

app = Flask(__name__)
app.config.from_object('config')
Triangle(app)
db = SQLAlchemy(app)

from app import views, models
