from app import db

class Game(db.Model):
	id = db.Column(db.String(10), primary_key=True)
	grid = db.Column(db.String(25))

	def __repr__(self):
		return '<Game %r>' % (self.grid)