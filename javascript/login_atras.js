// =========================================================================
// SISTEMA DEFINITIVO DEL BOTÓN DE CABECERA (LOGIN / LOGOUT) Y SESIÓN TEMPORAL
// =========================================================================

let vistaIntencion = null;

// Pantallas que solo se pueden usar con la sesión iniciada. Si se cierra la
// sesión estando en una de ellas, se vuelve a la pantalla principal.
const VISTAS_CON_SESION = ['vista-prod-baj', 'vista-prod-com', 'vista-publicado'];

// =========================================================================
// MOSTRAR / OCULTAR CONTRASEÑA INDEPENDIENTE
// =========================================================================
function toggleMostrarPassword(inputId, btnId) {
    const inputPass = document.getElementById(inputId);
    const btnPass = document.getElementById(btnId);

    if (inputPass && inputPass.type === "password") {
        inputPass.type = "text";
        if (btnPass) btnPass.innerHTML = 'Ocultar<span class="sr-only"> contraseña</span>';
    } else if (inputPass) {
        inputPass.type = "password";
        if (btnPass) btnPass.innerHTML = 'Mostrar<span class="sr-only"> contraseña</span>';
    }
}
// 1. Qué pasa cuando haces clic en el botón de la cabecera
async function gestionarClickLogin(boton) {
    const estadoSesion = sessionStorage.getItem('sesionIniciada');

    if (estadoSesion === '1') {
        try {
            if (typeof window.supabase !== 'undefined') {
                await window.supabase.auth.signOut();
            }
        } catch (error) {
            console.error("Error al cerrar sesión:", error);
        }

        sessionStorage.removeItem('sesionIniciada');
        sessionStorage.removeItem('nombreUsuario');

        const vistaActual = typeof obtenerVistaVisible === 'function' ? obtenerVistaVisible() : null;

        if (vistaActual && VISTAS_CON_SESION.includes(vistaActual.id)) {
            // Estaba subiendo un producto: recargamos (vuelve a la pantalla
            // principal y el formulario a medias queda vacío)
            window.location.reload();
            return;
        }

        // En el resto de pantallas se queda donde estaba
        pintarBotonLogin();

        // Si está viendo un producto, quitamos la marca de su voto
        document.querySelectorAll('[id^="detalle-ver-valoracion"]').forEach(contenedor => {
            contenedor.dataset.votoUsuario = '';
            contenedor.querySelectorAll('.btn-valoracion-independiente').forEach(btn => {
                btn.classList.remove('active-filtro');
                btn.setAttribute('aria-pressed', 'false');
            });
        });

        const anuncio = document.getElementById('anuncio-accesible');
        if (anuncio) anuncio.innerText = 'Has cerrado la sesión';

    } else {
        // Inicio de sesión desde la cabecera: no hay formulario pendiente que abrir después
        if (typeof subidaPendienteTrasLogin !== 'undefined') subidaPendienteTrasLogin = null;
        abrirModal('modal-login');
    }
}
// =========================================================================
// MENÚ DEL TELÉFONO (botón ☰ arriba a la izquierda)
// Reúne lo que en el ordenador está en la cabecera y en los botones
// laterales: sesión, registro, accesibilidad, información, contacto y
// agradecimientos.
// =========================================================================
function abrirMenuMovil() {
    // La opción de sesión dice lo que hará ahora mismo
    const conSesion = sessionStorage.getItem('sesionIniciada') === '1';
    const textoSesion = document.getElementById('menu-movil-sesion-texto');
    if (textoSesion) {
        textoSesion.innerText = conSesion ? 'Cerrar sesión' : 'Iniciar sesión';
    }
    // Con la sesión iniciada, "Cerrar sesión" va en rojo (como en el ordenador)
    const opcionSesion = document.getElementById('menu-movil-sesion');
    if (opcionSesion) opcionSesion.classList.toggle('menu-movil-sesion-activa', conSesion);
    abrirModal('menu-movil');
}

function opcionMenuMovil(opcion) {
    cerrarModal('menu-movil');

    if (opcion === 'sesion') {
        gestionarClickLogin(document.getElementById('mi-boton-login'));
    } else if (opcion === 'registro') {
        const btnRegistro = document.getElementById('btn-solicitud');
        if (btnRegistro) cambiarEstadoslider(btnRegistro);
        window.scrollTo(0, 0);
    } else {
        abrirModal(opcion);
    }
}

// Pulsar fuera del panel (en la zona oscurecida) también lo cierra
document.addEventListener('DOMContentLoaded', () => {
    const menu = document.getElementById('menu-movil');
    if (!menu) return;
    menu.addEventListener('click', (evento) => {
        if (evento.target === menu) menu.close();
    });
});

// 2. Pintar el botón según el estado
function pintarBotonLogin() {
    const boton = document.getElementById('mi-boton-login');
    if (!boton) return;

    const estadoSesion = sessionStorage.getItem('sesionIniciada');

    if (estadoSesion === '1') {
        const estadoSesion = sessionStorage.getItem('sesionIniciada');
        const botonLogin = document.getElementById('mi-boton-login'); // Asegúrate de que este sea el id de tu botón de sesión

        if (estadoSesion === '1' && botonLogin) {
            // Añadimos la clase CSS para el fondo rojo y texto blanco
            botonLogin.classList.add('btn-sesion-activa');

            // Cambiamos el texto del botón
            botonLogin.innerText = "Cerrar sesión";
        }
    } else {
        // --- AQUÍ CAMBIAS EL ASPECTO CUANDO NO HAY SESIÓN ---

        // Restauramos los colores por defecto quitando los estilos que pusimos arriba
        boton.classList.remove('btn-sesion-activa');
        boton.style.backgroundColor = "";
        boton.style.color = "";
        boton.style.border = "";

        boton.innerText = "Iniciar sesión";
    }
}

// 3. Que se pinte automáticamente al cargar la página
document.addEventListener('DOMContentLoaded', pintarBotonLogin);

// =========================================================================
// SELECCIÓN DE PERFILES
// =========================================================================
let perfilSeleccionadoSolicitud = null;
function seleccionarPerfilFormulario(botonPulsado) {
    const contenedor = botonPulsado.closest('.guia-card');
    if (contenedor) {
        contenedor.querySelectorAll('.btn-rela').forEach(btn => {
            btn.classList.remove('activ-cate', 'campo-error'); // al elegir perfil se quita el rojo de todos
        });
    }
    botonPulsado.classList.add('activ-cate');
    perfilSeleccionadoSolicitud = botonPulsado.getAttribute('data-perfil');
    if (typeof ocultarAvisoSolicitudSiCorrecto === 'function') ocultarAvisoSolicitudSiCorrecto();
}