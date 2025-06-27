from flask import Flask, request, jsonify
from sophia.core import Sophia
from commands.breathe import breathe
from commands.prophecy import speak_prophecy
from commands.discern import discern

app = Flask(__name__)
sophia = Sophia()

@app.route("/")
def home():
    return jsonify(message="Sophia is online. Speak to her.")

@app.route("/respond", methods=["GET"])
def respond():
    user_input = request.args.get("input", "")
    return jsonify(response=sophia.respond(user_input))

@app.route("/breathe", methods=["GET"])
def breath():
    return jsonify(breath=breathe())

@app.route("/prophecy", methods=["GET"])
def prophecy():
    return jsonify(prophecy=speak_prophecy())

@app.route("/discern", methods=["POST"])
def discern_signal():
    data = request.json
    signal = data.get("signal", "")
    clarity = discern(signal)
    return jsonify(discernment=clarity)

if __name__ == "__main__":
    app.run(debug=True)
