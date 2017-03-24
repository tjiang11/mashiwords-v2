from app import app, db, models
from flask import render_template, jsonify
import random
import string

@app.route('/')
@app.route('/index')
def index():
    return render_template("index.html")

@app.route('/codenames_card.html')
def serve_partial():
    return render_template("codenames_card.html")

@app.route('/info-modal.html')
def serve_info_modal():
    return render_template("info-modal.html")

@app.route('/custom-words-modal.html')
def serve_custom_words_modal():
    return render_template("custom-words-modal.html")

@app.route('/spymaster_body.html')
def spymaster_body():
    return render_template("spymaster_body.html")

@app.route('/spymaster/<game_id>')
def spymaster(game_id):
    return render_template("spymaster.html")

@app.route('/create_game', methods=['POST'])
def create_game():
    random_id = ''.join(random.SystemRandom().choice(string.ascii_lowercase + string.digits) for _ in range(6))
    
    cardsRemaining = [9, 8, 7]
    totalCardsRemaining = 24
    grid = ''
    while totalCardsRemaining > 0:
        randInd = random.randrange(0, 3, 1)
        if cardsRemaining[randInd] > 0:
            cardsRemaining[randInd] -= 1
            totalCardsRemaining -= 1
            randomPos = random.randrange(0, len(grid) + 1, 1)
            grid = grid[:randomPos] + str(randInd) + grid[randomPos:]

    randomPos = random.randrange(0, len(grid) + 1, 1)
    grid = grid[:randomPos] + '3' + grid[randomPos:]

    game = models.Game(id=random_id, grid=grid)
    db.session.add(game)
    db.session.commit()
    resp_body = {
        'id': random_id,
        'grid': grid
    }
    return jsonify(data=resp_body)

@app.route('/game_data/<id>', methods=['GET'])
def join_game(id):
    game = models.Game.query.get(id)
    return jsonify(data=game.grid)
