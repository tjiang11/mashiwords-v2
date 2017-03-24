from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_triangle import Triangle

application = Flask(__name__)
application.config.from_object('config')
Triangle(application)
db = SQLAlchemy(application)

from app import views, models
