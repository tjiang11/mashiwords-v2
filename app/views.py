from app import application, db, models
from flask import render_template, jsonify
import random
import string

@application.route('/')
@application.route('/index')
def index():
    return render_template("index.html")

@application.route('/codenames_card.html')
def serve_partial():
    return render_template("codenames_card.html")

@application.route('/info-modal.html')
def serve_info_modal():
    return render_template("info-modal.html")

@application.route('/custom-words-modal.html')
def serve_custom_words_modal():
    return render_template("custom-words-modal.html")

@application.route('/spymaster_body.html')
def spymaster_body():
    return render_template("spymaster_body.html")

@application.route('/s/<game_id>')
def spymaster(game_id):
    return render_template("spymaster.html")

@application.route('/create_game', methods=['POST'])
def create_game():
    random_id = generate_random_id()
    grid = generate_grid()
    game = models.Game(id=random_id, grid=grid)
    db.session.add(game)
    db.session.commit()
    resp_body = {
        'id': random_id,
        'grid': grid
    }
    return jsonify(data=resp_body)

@application.route('/game_data/<id>', methods=['GET'])
def join_game(id):
    game = models.Game.query.get(id)
    return jsonify(data=game.grid)

@application.route('/new_round/<id>', methods=['PUT'])
def new_round(id):
    new_grid = generate_grid()
    game = models.Game.query.get(id)
    game.grid = new_grid
    db.session.commit()
    return jsonify(data=game.grid)

def generate_random_id():
    return ''.join(random.SystemRandom()
        .choice(string.ascii_lowercase + string.digits) 
        for _ in range(6))

def generate_grid():
    cardsRemaining = [9, 8, 7]
    totalCardsRemaining = 24
    new_grid = ''
    while totalCardsRemaining > 0:
        randInd = random.randrange(0, 3, 1)
        if cardsRemaining[randInd] > 0:
            cardsRemaining[randInd] -= 1
            totalCardsRemaining -= 1
            randomPos = random.randrange(0, len(new_grid) + 1, 1)
            new_grid = new_grid[:randomPos] + str(randInd) + new_grid[randomPos:]

    randomPos = random.randrange(0, len(new_grid) + 1, 1)
    new_grid = new_grid[:randomPos] + '3' + new_grid[randomPos:]
    return new_grid