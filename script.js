
function mostrarMensaje() {
    const mensaje = document.getElementById("mensaje");

    if (mensaje) {
        mensaje.textContent =
            "¡Bienvenido a tu misión ecológica!";
    }
}

const formulario = document.getElementById("formularioAccion");
const contenedor = document.getElementById("contenedorAcciones");
const total = document.getElementById("totalAcciones");
const resultado = document.getElementById("resultado");

let acciones = JSON.parse(
    localStorage.getItem("accionesEcoReto") || "[]"
);

let indiceEdicion = null;

function guardarAcciones() {
    localStorage.setItem(
        "accionesEcoReto",
        JSON.stringify(acciones)
    );
}

function actualizarEstadisticas() {
    const agua = acciones.filter(function(accion) {
        return accion.categoria === "Agua";
    }).length;

    const otras = acciones.length - agua;

    const totalAgua = document.getElementById("totalAgua");
    const totalOtras = document.getElementById("totalOtras");

    if (totalAgua) totalAgua.textContent = agua;
    if (totalOtras) totalOtras.textContent = otras;
}

function mostrarAcciones() {
    if (!contenedor || !total) return;

    contenedor.innerHTML = "";
    total.textContent =
        "Acciones registradas: " + acciones.length;

    actualizarEstadisticas();

    if (acciones.length === 0) {
        contenedor.textContent =
            "Aún no has registrado acciones.";
        return;
    }

    const buscador = document.getElementById("buscarAccion");
    const texto = buscador
        ? buscador.value.toLowerCase().trim()
        : "";

    const filtradas = acciones
        .map(function(accion, indice) {
            return { accion: accion, indice: indice };
        })
        .filter(function(item) {
            const a = item.accion;

            return (
                a.titulo.toLowerCase().includes(texto) ||
                a.categoria.toLowerCase().includes(texto) ||
                a.descripcion.toLowerCase().includes(texto)
            );
        });

    if (filtradas.length === 0) {
        contenedor.textContent =
            "No se encontraron acciones.";
        return;
    }

    filtradas.forEach(function(item) {
        const accion = item.accion;
        const indice = item.indice;

        const tarjeta = document.createElement("article");
        tarjeta.className = "accion";

        const titulo = document.createElement("h3");
        const categoria = document.createElement("p");
        const descripcion = document.createElement("p");
        const autor = document.createElement("p");
        const fecha = document.createElement("p");
        const botones = document.createElement("div");
        const editar = document.createElement("button");
        const eliminar = document.createElement("button");

        titulo.textContent = accion.titulo;
        categoria.textContent =
            "Categoría: " + accion.categoria;
        descripcion.textContent = accion.descripcion;
        autor.textContent =
            "Propuesto por: " + accion.propuesto;

        fecha.textContent = accion.fecha
            ? "Fecha: " + accion.fecha
            : "Fecha no indicada";

        botones.className = "acciones-botones";

        editar.textContent = "Editar";
        editar.type = "button";
        editar.className = "boton-editar";

        eliminar.textContent = "Eliminar";
        eliminar.type = "button";
        eliminar.className = "boton-eliminar";

        editar.addEventListener("click", function() {
            document.getElementById("titulo").value =
                accion.titulo;

            document.getElementById("categoria").value =
                accion.categoria;

            document.getElementById("descripcion").value =
                accion.descripcion;

            document.getElementById("propuesto").value =
                accion.propuesto;

            const campoFecha = document.getElementById("fecha");
            if (campoFecha) {
                campoFecha.value = accion.fecha || "";
            }

            indiceEdicion = indice;

            const botonGuardar = formulario.querySelector(
                'button[type="submit"]'
            );

            if (botonGuardar) {
                botonGuardar.textContent = "Guardar cambios";
            }

            if (resultado) {
                resultado.textContent =
                    "Edita los datos y guarda los cambios.";
            }

            formulario.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });
        });

        eliminar.addEventListener("click", function() {
            acciones.splice(indice, 1);
            guardarAcciones();

            if (indiceEdicion === indice) {
                indiceEdicion = null;
                formulario.reset();
            }

            mostrarAcciones();
        });

        botones.append(editar, eliminar);

        tarjeta.append(
            titulo,
            categoria,
            descripcion,
            autor,
            fecha,
            botones
        );

        contenedor.appendChild(tarjeta);
    });
}

if (formulario) {
    formulario.addEventListener("submit", function(evento) {
        evento.preventDefault();

        const campoFecha = document.getElementById("fecha");

        const accion = {
            titulo: document.getElementById("titulo").value.trim(),
            categoria: document.getElementById("categoria").value,
            descripcion: document.getElementById("descripcion").value.trim(),
            propuesto: document.getElementById("propuesto").value.trim(),
            fecha: campoFecha ? campoFecha.value : ""
        };

        if (
            !accion.titulo ||
            !accion.categoria ||
            !accion.descripcion ||
            !accion.propuesto
        ) {
            if (resultado) {
                resultado.textContent =
                    "Completa todos los campos.";
            }
            return;
        }

        if (indiceEdicion !== null) {
            acciones[indiceEdicion] = accion;

            if (resultado) {
                resultado.textContent =
                    "Acción actualizada correctamente.";
            }

            indiceEdicion = null;
        } else {
            acciones.push(accion);

            if (resultado) {
                resultado.textContent =
                    "Acción registrada correctamente.";
            }
        }

        guardarAcciones();
        formulario.reset();

        const botonGuardar = formulario.querySelector(
            'button[type="submit"]'
        );

        if (botonGuardar) {
            botonGuardar.textContent = "Guardar acción";
        }

        mostrarAcciones();
    });
}

const buscador = document.getElementById("buscarAccion");

if (buscador) {
    buscador.addEventListener("input", mostrarAcciones);
}

mostrarAcciones();
