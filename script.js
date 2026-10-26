
const formulario = document.getElementById("formularioAccion");
const contenedor = document.getElementById("contenedorAcciones");
const busqueda = document.getElementById("busqueda");
const btnGuardar = document.getElementById("btnGuardar");
const btnCancelar = document.getElementById("btnCancelar");

const campos = {
    titulo: document.getElementById("titulo"),
    categoria: document.getElementById("categoria"),
    descripcion: document.getElementById("descripcion"),
    fecha: document.getElementById("fecha"),
    propuesto: document.getElementById("propuesto"),
    resultado: document.getElementById("resultado")
};

let acciones = [];
let editandoId = null;

async function api(url, opciones = {}) {
    const respuesta = await fetch(url, {
        ...opciones,
        headers: {
            "Content-Type": "application/json",
            ...(opciones.headers || {})
        }
    });

    const datos = await respuesta.json();

    if (!respuesta.ok) {
        throw new Error(datos.error || "Ocurrió un error.");
    }

    return datos;
}

async function cargarAcciones() {
    try {
        acciones = await api("/api/acciones");
        mostrarAcciones();
        actualizarResumen();
    } catch (error) {
        console.error(error);
        contenedor.textContent =
            "No se pudieron cargar las acciones. Intenta recargar la página.";
    }
}

function agregarParrafo(tarjeta, etiqueta, valor) {
    if (!valor) return;

    const p = document.createElement("p");
    const strong = document.createElement("strong");

    strong.textContent = etiqueta;
    p.append(strong, document.createTextNode(valor));
    tarjeta.appendChild(p);
}

function mostrarAcciones() {
    contenedor.replaceChildren();

    const texto = busqueda.value.toLowerCase().trim();

    const filtradas = acciones.filter(a =>
        [a.titulo, a.categoria, a.descripcion, a.propuesto, a.resultado]
            .join(" ")
            .toLowerCase()
            .includes(texto)
    );

    if (filtradas.length === 0) {
        contenedor.textContent = texto
            ? "No se encontraron acciones."
            : "Todavía no hay acciones registradas.";
        return;
    }

    filtradas.forEach(a => {
        const tarjeta = document.createElement("article");
        tarjeta.className = "tarjeta-accion";

        const titulo = document.createElement("h3");
        titulo.textContent = a.titulo;
        tarjeta.appendChild(titulo);

        agregarParrafo(tarjeta, "Categoría: ", a.categoria);
        agregarParrafo(tarjeta, "Descripción: ", a.descripcion);
        agregarParrafo(tarjeta, "Fecha: ", a.fecha);
        agregarParrafo(tarjeta, "Propuesto por: ", a.propuesto);
        agregarParrafo(tarjeta, "Resultado: ", a.resultado);

        const botones = document.createElement("div");
        botones.className = "botones-accion";

        const editar = document.createElement("button");
        editar.textContent = "Editar";
        editar.type = "button";
        editar.addEventListener("click", () => prepararEdicion(a));

        const eliminar = document.createElement("button");
        eliminar.textContent = "Eliminar";
        eliminar.type = "button";
        eliminar.addEventListener("click", () => eliminarAccion(a.id));

        botones.append(editar, eliminar);
        tarjeta.appendChild(botones);
        contenedor.appendChild(tarjeta);
    });
}

function actualizarResumen() {
    document.getElementById("totalAcciones").textContent = acciones.length;

    const agua = acciones.filter(a =>
        (a.categoria || "").toLowerCase() === "agua"
    ).length;

    document.getElementById("totalAgua").textContent = agua;
    document.getElementById("totalOtras").textContent =
        acciones.length - agua;
}

function prepararEdicion(a) {
    editandoId = a.id;

    Object.keys(campos).forEach(clave => {
        campos[clave].value = a[clave] || "";
    });

    btnGuardar.textContent = "Actualizar acción";
    btnCancelar.hidden = false;
    formulario.scrollIntoView({ behavior: "smooth" });
}

function limpiarFormulario() {
    formulario.reset();
    editandoId = null;
    btnGuardar.textContent = "Guardar acción";
    btnCancelar.hidden = true;
}

formulario.addEventListener("submit", async evento => {
    evento.preventDefault();

    const datos = {};
    Object.keys(campos).forEach(clave => {
        datos[clave] = campos[clave].value.trim();
    });

    try {
        btnGuardar.disabled = true;

        if (editandoId !== null) {
            alert("La edición aún no está habilitada en el servidor.");
            return;
        }

        await api("/api/acciones", {
            method: "POST",
            body: JSON.stringify(datos)
        });

        limpiarFormulario();
        await cargarAcciones();
        alert("¡Acción guardada en Neon!");
    } catch (error) {
        console.error(error);
        alert(error.message);
    } finally {
        btnGuardar.disabled = false;
    }
});

btnCancelar.addEventListener("click", limpiarFormulario);
busqueda.addEventListener("input", mostrarAcciones);

async function eliminarAccion(id) {
    if (!confirm("¿Quieres eliminar esta acción?")) return;

    try {
        await api(`/api/acciones/${id}`, { method: "DELETE" });
        await cargarAcciones();
    } catch (error) {
        console.error(error);
        alert(error.message);
    }
}

cargarAcciones();
