
const formulario = document.getElementById("formularioAccion");
const titulo = document.getElementById("titulo");
const categoria = document.getElementById("categoria");
const descripcion = document.getElementById("descripcion");
const fecha = document.getElementById("fecha");
const propuesto = document.getElementById("propuesto");
const resultado = document.getElementById("resultado");

const btnGuardar = document.getElementById("btnGuardar");
const btnCancelar = document.getElementById("btnCancelar");
const contenedorAcciones = document.getElementById("contenedorAcciones");
const busqueda = document.getElementById("busqueda");

const totalAcciones = document.getElementById("totalAcciones");
const totalAgua = document.getElementById("totalAgua");
const totalOtras = document.getElementById("totalOtras");

let acciones = [];
let editandoId = null;

async function consultarAPI(url, opciones = {}) {
    const respuesta = await fetch(url, {
        ...opciones,
        headers: {
            "Content-Type": "application/json",
            ...(opciones.headers || {})
        }
    });

    const datos = await respuesta.json().catch(() => ({}));

    if (!respuesta.ok) {
        throw new Error(datos.error || "Ocurrió un error.");
    }

    return datos;
}

async function cargarAcciones() {
    try {
        acciones = await consultarAPI("/api/acciones");
        mostrarAcciones();
        actualizarResumen();
    } catch (error) {
        console.error(error);
        alert("No se pudieron cargar las acciones. Revisa tu conexión.");
    }
}

function mostrarAcciones() {
    if (!contenedorAcciones) return;

    const texto = (busqueda?.value || "").toLowerCase().trim();

    const filtradas = acciones.filter(accion => {
        const contenido = [
            accion.titulo,
            accion.categoria,
            accion.descripcion,
            accion.propuesto,
            accion.resultado
        ].join(" ").toLowerCase();

        return contenido.includes(texto);
    });

    contenedorAcciones.replaceChildren();

    if (filtradas.length === 0) {
        const mensaje = document.createElement("p");
        mensaje.textContent = texto
            ? "No se encontraron acciones."
            : "Todavía no hay acciones registradas.";
        contenedorAcciones.appendChild(mensaje);
        return;
    }

    filtradas.forEach(accion => {
        const tarjeta = document.createElement("article");
        tarjeta.className = "tarjeta-accion";

        const encabezado = document.createElement("h3");
        encabezado.textContent = accion.titulo;
        tarjeta.appendChild(encabezado);

        const categoriaTexto = document.createElement("p");
        categoriaTexto.textContent = "Categoría: " + accion.categoria;
        tarjeta.appendChild(categoriaTexto);

        if (accion.descripcion) {
            agregarTexto(tarjeta, "Descripción: ", accion.descripcion);
        }

        if (accion.fecha) {
            agregarTexto(tarjeta, "Fecha: ", accion.fecha);
        }

        if (accion.propuesto) {
            agregarTexto(tarjeta, "Propuesto por: ", accion.propuesto);
        }

        if (accion.resultado) {
            agregarTexto(tarjeta, "Resultado: ", accion.resultado);
        }

        const botones = document.createElement("div");
        botones.className = "botones-accion";

        const editar = document.createElement("button");
        editar.type = "button";
        editar.textContent = "Editar";
        editar.addEventListener("click", () => prepararEdicion(accion));

        const eliminar = document.createElement("button");
        eliminar.type = "button";
        eliminar.textContent = "Eliminar";
        eliminar.addEventListener("click", () => eliminarAccion(accion.id));

        botones.append(editar, eliminar);
        tarjeta.appendChild(botones);
        contenedorAcciones.appendChild(tarjeta);
    });
}

function agregarTexto(contenedor, etiqueta, valor) {
    const parrafo = document.createElement("p");
    const negrita = document.createElement("strong");

    negrita.textContent = etiqueta;
    parrafo.append(negrita, document.createTextNode(valor));
    contenedor.appendChild(parrafo);
}

function actualizarResumen() {
    if (totalAcciones) {
        totalAcciones.textContent = acciones.length;
    }

    const cantidadAgua = acciones.filter(accion =>
        (accion.categoria || "").toLowerCase() === "agua"
    ).length;

    if (totalAgua) {
        totalAgua.textContent = cantidadAgua;
    }

    if (totalOtras) {
        totalOtras.textContent = acciones.length - cantidadAgua;
    }
}

function prepararEdicion(accion) {
    editandoId = accion.id;

    titulo.value = accion.titulo || "";
    categoria.value = accion.categoria || "";
    descripcion.value = accion.descripcion || "";
    fecha.value = accion.fecha || "";
    propuesto.value = accion.propuesto || "";
    resultado.value = accion.resultado || "";

    if (btnGuardar) btnGuardar.textContent = "Actualizar acción";
    if (btnCancelar) btnCancelar.hidden = false;

    formulario?.scrollIntoView({ behavior: "smooth", block: "start" });
}

function limpiarFormulario() {
    formulario?.reset();
    editandoId = null;

    if (btnGuardar) btnGuardar.textContent = "Guardar acción";
    if (btnCancelar) btnCancelar.hidden = true;
}

async function guardarAccion(evento) {
    evento.preventDefault();

    const datos = {
        titulo: titulo.value.trim(),
        categoria: categoria.value,
        descripcion: descripcion.value.trim(),
        fecha: fecha.value,
        propuesto: propuesto.value.trim(),
        resultado: resultado.value.trim()
    };

    if (!datos.titulo || !datos.categoria) {
        alert("Escribe el título y selecciona una categoría.");
        return;
    }

    try {
        if (btnGuardar) btnGuardar.disabled = true;

        if (editandoId !== null) {
            // La ruta PUT se agregará al backend para habilitar la edición.
            throw new Error(
                "La edición todavía no está habilitada en el servidor. " +
                "Por ahora puedes cancelar y registrar una acción nueva."
            );
        }

        await consultarAPI("/api/acciones", {
            method: "POST",
            body: JSON.stringify(datos)
        });

        limpiarFormulario();
        await cargarAcciones();
        alert("¡Acción guardada en Neon correctamente!");
    } catch (error) {
        console.error(error);
        alert(error.message || "No se pudo guardar la acción.");
    } finally {
        if (btnGuardar) btnGuardar.disabled = false;
    }
}

async function eliminarAccion(id) {
    if (!confirm("¿Seguro que deseas eliminar esta acción?")) {
        return;
    }

    try {
        await consultarAPI(`/api/acciones/${id}`, {
            method: "DELETE"
        });

        await cargarAcciones();
        alert("Acción eliminada correctamente.");
    } catch (error) {
        console.error(error);
        alert(error.message || "No se pudo eliminar la acción.");
    }
}

formulario?.addEventListener("submit", guardarAccion);
btnCancelar?.addEventListener("click", limpiarFormulario);
busqueda?.addEventListener("input", mostrarAcciones);

if (btnCancelar) btnCancelar.hidden = true;

cargarAcciones();

