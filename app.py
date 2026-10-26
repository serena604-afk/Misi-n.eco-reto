
import os

from flask import Flask, render_template, jsonify, request
import psycopg2
from psycopg2.extras import RealDictCursor

app = Flask(
    __name__,
    template_folder=".",
    static_folder=".",
    static_url_path="/archivos"
)


def conectar_bd():
    url = os.environ.get("DATABASE_URL")

    if not url:
        raise RuntimeError("Falta configurar DATABASE_URL en Render.")

    return psycopg2.connect(url)


@app.route("/")
def inicio():
    return render_template("index.html")


@app.route("/api/estado")
def estado():
    try:
        with conectar_bd() as conn:
            with conn.cursor() as cur:
                cur.execute("SELECT 1")

        return jsonify({
            "mensaje": "Servidor y Neon conectados"
        })

    except Exception:
        app.logger.exception("Error al conectar con Neon")
        return jsonify({
            "error": "No se pudo conectar con la base de datos"
        }), 500


@app.route("/api/acciones", methods=["GET"])
def obtener_acciones():
    try:
        with conectar_bd() as conn:
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                cur.execute("""
                    SELECT id, titulo, categoria, descripcion,
                           fecha, propuesto, resultado, creado_en
                    FROM acciones
                    ORDER BY id DESC
                """)
                acciones = cur.fetchall()

        for accion in acciones:
            for campo, valor in accion.items():
                if valor is not None and hasattr(valor, "isoformat"):
                    accion[campo] = valor.isoformat()

        return jsonify(acciones)

    except Exception:
        app.logger.exception("Error al consultar acciones")
        return jsonify({
            "error": "No se pudieron cargar las acciones"
        }), 500


@app.route("/api/acciones", methods=["POST"])
def guardar_accion():
    datos = request.get_json(silent=True)

    if not isinstance(datos, dict):
        return jsonify({
            "error": "Los datos deben enviarse en formato JSON"
        }), 400

    titulo = str(datos.get("titulo") or "").strip()
    categoria = str(datos.get("categoria") or "").strip()

    if not titulo or not categoria:
        return jsonify({
            "error": "El título y la categoría son obligatorios"
        }), 400

    if len(titulo) > 150 or len(categoria) > 50:
        return jsonify({
            "error": "El título o la categoría son demasiado largos"
        }), 400

    descripcion = datos.get("descripcion") or None
    fecha = datos.get("fecha") or None
    propuesto = datos.get("propuesto") or None
    resultado = datos.get("resultado") or None

    try:
        with conectar_bd() as conn:
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                cur.execute("""
                    INSERT INTO acciones
                    (titulo, categoria, descripcion, fecha,
                     propuesto, resultado)
                    VALUES (%s, %s, %s, %s, %s, %s)
                    RETURNING id, titulo, categoria, descripcion,
                              fecha, propuesto, resultado, creado_en
                """, (
                    titulo, categoria, descripcion, fecha,
                    propuesto, resultado
                ))

                accion = cur.fetchone()

        for campo, valor in accion.items():
            if valor is not None and hasattr(valor, "isoformat"):
                accion[campo] = valor.isoformat()

        return jsonify(accion), 201

    except Exception:
        app.logger.exception("Error al guardar la acción")
        return jsonify({
            "error": "No se pudo guardar la acción"
        }), 500


@app.route("/api/acciones/<int:accion_id>", methods=["DELETE"])
def eliminar_accion(accion_id):
    try:
        with conectar_bd() as conn:
            with conn.cursor() as cur:
                cur.execute(
                    "DELETE FROM acciones WHERE id = %s",
                    (accion_id,)
                )

                if cur.rowcount == 0:
                    return jsonify({
                        "error": "La acción no existe"
                    }), 404

        return jsonify({
            "mensaje": "Acción eliminada correctamente"
        })

    except Exception:
        app.logger.exception("Error al eliminar la acción")
        return jsonify({
            "error": "No se pudo eliminar la acción"
        }), 500


if __name__ == "__main__":
    app.run(debug=True)
