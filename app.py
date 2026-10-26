
from flask import Flask, jsonify

app = Flask(__name__)


@app.route("/")
def inicio():
    return """
    <h1>Mision Eco-Reto</h1>
    <p>El servidor Flask esta funcionando.</p>
    """


@app.route("/api/estado")
def estado():
    return jsonify({
        "mensaje": "Servidor de Mision Eco-Reto funcionando"
    })


if __name__ == "__main__":
    app.run(debug=True)
