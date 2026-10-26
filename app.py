from flask import Flask, render_template, jsonify

app = Flask(
    __name__,
    template_folder=".",
    static_folder=".",
    static_url_path="/archivos"
)

@app.route("/")
def inicio():
    return render_template("index.html")

@app.route("/api/estado")
def estado():
    return jsonify({
        "mensaje": "Servidor de Mision Eco-Reto funcionando"
    })

if __name__ == "__main__":
    app.run(debug=True)
