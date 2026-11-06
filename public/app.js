// Detectar automáticamente la URL base del servidor (funciona en http://localhost:3000 o abriendo el HTML directamente)
const API_BASE = (window.location.protocol === 'http:' || window.location.protocol === 'https:')
  ? '' 
  : 'http://localhost:3000';

// Variable para almacenar el token JWT en memoria del cliente
let authToken = localStorage.getItem('jwt_token') || null;
let currentUsername = localStorage.getItem('jwt_user') || null;

// Elementos del DOM - Autenticación
const registerForm = document.getElementById('registerForm');
const loginForm = document.getElementById('loginForm');
const regUsername = document.getElementById('regUsername');
const regPassword = document.getElementById('regPassword');
const loginUsername = document.getElementById('loginUsername');
const loginPassword = document.getElementById('loginPassword');
const authActiveUser = document.getElementById('authActiveUser');
const loggedUsername = document.getElementById('loggedUsername');
const logoutBtn = document.getElementById('logoutBtn');
const tokenBox = document.getElementById('tokenBox');
const tokenValue = document.getElementById('tokenValue');
const checkProfileBtn = document.getElementById('checkProfileBtn');
const sessionStatus = document.getElementById('sessionStatus');

// Elementos del DOM
const personaForm = document.getElementById('personaForm');
const formTitle = document.getElementById('formTitle');
const formMethodBadge = document.getElementById('formMethodBadge');
const submitBtn = document.getElementById('submitBtn');
const cancelEditBtn = document.getElementById('cancelEditBtn');
const isEditingInput = document.getElementById('isEditing');

const idInput = document.getElementById('identificacion');
const nombreInput = document.getElementById('nombre');
const edadInput = document.getElementById('edad');

const searchIdInput = document.getElementById('searchIdInput');
const searchIdBtn = document.getElementById('searchIdBtn');

const searchNombreInput = document.getElementById('searchNombreInput');
const searchNombreBtn = document.getElementById('searchNombreBtn');

const viewAllBtn = document.getElementById('viewAllBtn');
const tableBody = document.getElementById('tableBody');
const listSubtitle = document.getElementById('listSubtitle');

const metricTotal = document.getElementById('metricTotal');
const metricAvg = document.getElementById('metricAvg');
const metricStatus = document.getElementById('metricStatus');

const lastMethodEl = document.getElementById('lastMethod');
const lastUrlEl = document.getElementById('lastUrl');
const lastStatusCodeEl = document.getElementById('lastStatusCode');
const lastTimeEl = document.getElementById('lastTime');
const jsonViewer = document.getElementById('jsonViewer');
const clearConsoleBtn = document.getElementById('clearConsoleBtn');
const toastContainer = document.getElementById('toastContainer');

// Inicialización al cargar la página
document.addEventListener('DOMContentLoaded', () => {
  actualizarEstadoSesionUI();
  obtenerTodasLasPersonas();

  // Event Listeners - Auth
  if (registerForm) registerForm.addEventListener('submit', manejarRegistro);
  if (loginForm) loginForm.addEventListener('submit', manejarLogin);
  if (logoutBtn) logoutBtn.addEventListener('click', cerrarSesion);
  if (checkProfileBtn) checkProfileBtn.addEventListener('click', validarPerfilToken);

  // Event Listeners
  personaForm.addEventListener('submit', manejarSubmit);
  cancelEditBtn.addEventListener('click', cancelarEdicion);
  searchIdBtn.addEventListener('click', buscarPorIdentificacion);
  searchNombreBtn.addEventListener('click', filtrarPorNombre);
  viewAllBtn.addEventListener('click', obtenerTodasLasPersonas);
  clearConsoleBtn.addEventListener('click', limpiarConsola);

  // Permitir presionar "Enter" en los inputs de búsqueda
  searchIdInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      buscarPorIdentificacion();
    }
  });

  searchNombreInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      filtrarPorNombre();
    }
  });
});

/**
 * Función central para ejecutar peticiones HTTP y actualizar la consola JSON
 */
async function realizarPeticion(metodo, endpoint, datos = null) {
  const urlCompleta = `${API_BASE}${endpoint}`;
  const opciones = {
    method: metodo,
    headers: {
      'Content-Type': 'application/json'
    }
  };

  // Incluir el token JWT en el encabezado Authorization si existe
  if (authToken) {
    opciones.headers['Authorization'] = `Bearer ${authToken}`;
  }

  if (datos && (metodo === 'POST' || metodo === 'PUT')) {
    opciones.body = JSON.stringify(datos);
  }

  const inicioTiempo = performance.now();
  let respuesta;
  let jsonResultado;

  try {
    respuesta = await fetch(urlCompleta, opciones);
    jsonResultado = await respuesta.json().catch(() => ({}));
  } catch (error) {
    const finTiempo = Math.round(performance.now() - inicioTiempo);
    actualizarConsola(metodo, endpoint, 0, 'Error de conexión', finTiempo, {
      error: 'No se pudo conectar con el servidor',
      detalle: error.message
    });
    mostrarToast('No se pudo conectar con el servidor. ¿Está encendido?', 'error');
    throw error;
  }

  const finTiempo = Math.round(performance.now() - inicioTiempo);
  actualizarConsola(metodo, endpoint, respuesta.status, respuesta.statusText, finTiempo, jsonResultado);

  return {
    ok: respuesta.ok,
    status: respuesta.status,
    data: jsonResultado
  };
}

/**
 * Actualiza la consola visual de respuestas HTTP
 */
function actualizarConsola(metodo, endpoint, status, statusText, duracionMs, data) {
  lastMethodEl.textContent = metodo;
  lastMethodEl.className = `pill method-pill method-${metodo.toLowerCase()}`;
  lastUrlEl.textContent = endpoint;
  lastTimeEl.textContent = `${duracionMs} ms`;

  if (status >= 200 && status < 300) {
    lastStatusCodeEl.className = 'pill status-pill status-ok';
    lastStatusCodeEl.textContent = `${status} ${statusText || 'OK'}`;
    metricStatus.textContent = `${metodo} ${endpoint} (200 OK)`;
  } else {
    lastStatusCodeEl.className = 'pill status-pill status-error';
    lastStatusCodeEl.textContent = `${status || 'ERR'} ${statusText || 'Error'}`;
    metricStatus.textContent = `${metodo} ${endpoint} (${status || 'Error'})`;
  }

  jsonViewer.textContent = JSON.stringify(data, null, 2);
}

function limpiarConsola() {
  jsonViewer.textContent = '// Consola limpia';
  lastStatusCodeEl.textContent = '-';
  lastStatusCodeEl.className = 'pill status-pill';
}

/**
 * 1. GET /personas -> Obtener todas las personas
 */
async function obtenerTodasLasPersonas() {
  try {
    const { ok, data } = await realizarPeticion('GET', '/personas');
    if (ok) {
      const lista = data.data || [];
      renderizarTabla(lista);
      actualizarMetricas(lista);
      listSubtitle.textContent = `Mostrando todas las personas (${lista.length})`;
    }
  } catch (error) {
    console.error('Error al obtener personas:', error);
  }
}

/**
 * 2. GET /personas/:identificacion -> Buscar persona específica por ID
 */
async function buscarPorIdentificacion() {
  const id = searchIdInput.value.trim();
  if (!id) {
    mostrarToast('Ingresa una identificación para buscar', 'error');
    searchIdInput.focus();
    return;
  }

  try {
    const { ok, status, data } = await realizarPeticion('GET', `/personas/${encodeURIComponent(id)}`);
    if (ok && data.data) {
      renderizarTabla([data.data]);
      listSubtitle.textContent = `Resultado para ID: "${id}"`;
      mostrarToast(`Persona con ID ${id} encontrada`, 'success');
    } else if (status === 404) {
      renderizarTabla([]);
      listSubtitle.textContent = `No se encontró persona con ID: "${id}"`;
      mostrarToast(`No existe ninguna persona con ID ${id}`, 'error');
    }
  } catch (error) {
    console.error('Error al buscar por ID:', error);
  }
}

/**
 * 3. GET /personas/nombre/:nombre -> Filtrar personas por nombre
 */
async function filtrarPorNombre() {
  const nombre = searchNombreInput.value.trim();
  if (!nombre) {
    mostrarToast('Ingresa un nombre para filtrar', 'error');
    searchNombreInput.focus();
    return;
  }

  try {
    const { ok, status, data } = await realizarPeticion('GET', `/personas/nombre/${encodeURIComponent(nombre)}`);
    if (ok && data.data) {
      renderizarTabla(data.data);
      listSubtitle.textContent = `Resultados para el nombre: "${nombre}" (${data.data.length})`;
      mostrarToast(`Se encontraron ${data.data.length} coincidencia(s)`, 'success');
    } else if (status === 404) {
      renderizarTabla([]);
      listSubtitle.textContent = `Sin resultados para "${nombre}"`;
      mostrarToast(`No se encontraron personas con el nombre "${nombre}"`, 'error');
    }
  } catch (error) {
    console.error('Error al filtrar por nombre:', error);
  }
}

/**
 * 4. POST /personas o PUT /personas/:id -> Guardar o actualizar persona
 */
async function manejarSubmit(e) {
  e.preventDefault();

  const identificacion = idInput.value.trim();
  const nombre = nombreInput.value.trim();
  const edadValor = edadInput.value.trim();
  const esEdicion = isEditingInput.value === 'true';

  if (!identificacion) {
    mostrarToast('La identificación es obligatoria', 'error');
    idInput.focus();
    return;
  }

  if (!nombre) {
    mostrarToast('El nombre es obligatorio', 'error');
    nombreInput.focus();
    return;
  }

  if (edadValor === '' || isNaN(edadValor) || Number(edadValor) < 0) {
    mostrarToast('La edad debe ser un número entero mayor o igual a 0', 'error');
    edadInput.focus();
    return;
  }

  const edadNumero = Number(edadValor);

  if (esEdicion) {
    // PUT /personas/:identificacion
    const { ok, data } = await realizarPeticion('PUT', `/personas/${encodeURIComponent(identificacion)}`, {
      nombre,
      edad: edadNumero
    });

    if (ok) {
      mostrarToast(`Persona con ID ${identificacion} actualizada exitosamente`, 'success');
      cancelarEdicion();
      await obtenerTodasLasPersonas();
    } else {
      mostrarToast(data.error || 'Error al actualizar', 'error');
    }
  } else {
    // POST /personas
    const { ok, data } = await realizarPeticion('POST', '/personas', {
      identificacion,
      nombre,
      edad: edadNumero
    });

    if (ok) {
      mostrarToast(`Persona "${nombre}" registrada exitosamente en memoria`, 'success');
      personaForm.reset();
      await obtenerTodasLasPersonas();
    } else {
      mostrarToast(data.error || data.mensaje || 'Error al registrar', 'error');
    }
  }
}

/**
 * 5. Iniciar y Cancelar Modo de Edición
 */
function iniciarEdicion(persona) {
  isEditingInput.value = 'true';
  idInput.value = persona.identificacion;
  idInput.disabled = true;
  nombreInput.value = persona.nombre;
  edadInput.value = persona.edad;

  formTitle.textContent = 'Editar Persona';
  formMethodBadge.textContent = 'PUT';
  formMethodBadge.className = 'method-badge method-put';
  submitBtn.textContent = 'Actualizar Persona (PUT)';
  cancelEditBtn.style.display = 'inline-block';

  nombreInput.focus();
}

function cancelarEdicion() {
  isEditingInput.value = 'false';
  idInput.disabled = false;
  personaForm.reset();

  formTitle.textContent = 'Registrar Persona';
  formMethodBadge.textContent = 'POST';
  formMethodBadge.className = 'method-badge method-post';
  submitBtn.textContent = 'Guardar Persona (POST)';
  cancelEditBtn.style.display = 'none';
}

/**
 * 6. DELETE /personas/:identificacion -> Eliminar persona
 */
async function eliminarPersona(identificacion, nombre) {
  const confirmar = confirm(`¿Estás seguro de eliminar a "${nombre}" (ID: ${identificacion}) de la memoria?`);
  if (!confirmar) return;

  const { ok, data } = await realizarPeticion('DELETE', `/personas/${encodeURIComponent(identificacion)}`);
  if (ok) {
    mostrarToast(`Persona "${nombre}" eliminada de la memoria`, 'success');

    if (isEditingInput.value === 'true' && idInput.value === identificacion) {
      cancelarEdicion();
    }

    await obtenerTodasLasPersonas();
  } else {
    mostrarToast(data.error || 'Error al eliminar', 'error');
  }
}

/**
 * Renderizado de la tabla HTML
 */
function renderizarTabla(lista) {
  tableBody.innerHTML = '';

  if (!lista || lista.length === 0) {
    tableBody.innerHTML = `
      <tr class="empty-row">
        <td colspan="4">No hay personas para mostrar con el criterio seleccionado.</td>
      </tr>
    `;
    return;
  }

  lista.forEach((p) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><span class="id-badge">${escapeHtml(p.identificacion)}</span></td>
      <td><strong>${escapeHtml(p.nombre)}</strong></td>
      <td>${escapeHtml(String(p.edad))} años</td>
      <td class="text-right">
        <button class="btn btn-sm btn-edit" title="Editar con PUT">Editar</button>
        <button class="btn btn-sm btn-delete" title="Eliminar con DELETE">Eliminar</button>
      </td>
    `;

    tr.querySelector('.btn-edit').addEventListener('click', () => iniciarEdicion(p));
    tr.querySelector('.btn-delete').addEventListener('click', () => eliminarPersona(p.identificacion, p.nombre));

    tableBody.appendChild(tr);
  });
}

/**
 * Métricas de personas en memoria
 */
function actualizarMetricas(lista) {
  metricTotal.textContent = lista.length;

  if (lista.length === 0) {
    metricAvg.textContent = '-';
  } else {
    const totalEdad = lista.reduce((acc, p) => acc + Number(p.edad), 0);
    metricAvg.textContent = `${(totalEdad / lista.length).toFixed(1)} años`;
  }
}

/**
 * Toasts flotantes
 */
function mostrarToast(mensaje, tipo = 'success') {
  const toast = document.createElement('div');
  toast.className = `toast toast-${tipo}`;
  toast.textContent = mensaje;
  toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, 3500);
}

/**
 * Funciones de Autenticación (Login, Registro, JWT)
 */
async function manejarRegistro(e) {
  e.preventDefault();
  const username = regUsername.value.trim();
  const password = regPassword.value;

  if (!username || !password) {
    mostrarToast('Por favor completa todos los campos de registro', 'error');
    return;
  }

  const { ok, data } = await realizarPeticion('POST', '/auth/register', { username, password });
  if (ok) {
    mostrarToast(`Usuario "${username}" registrado con contraseña encriptada (bcrypt)`, 'success');
    registerForm.reset();
  } else {
    mostrarToast(data.error || data.mensaje || 'Error al registrar', 'error');
  }
}

async function manejarLogin(e) {
  e.preventDefault();
  const username = loginUsername.value.trim();
  const password = loginPassword.value;

  if (!username || !password) {
    mostrarToast('Por favor ingresa usuario y contraseña', 'error');
    return;
  }

  const { ok, data } = await realizarPeticion('POST', '/auth/login', { username, password });
  if (ok && data.token) {
    authToken = data.token;
    currentUsername = data.usuario.username;

    localStorage.setItem('jwt_token', authToken);
    localStorage.setItem('jwt_user', currentUsername);

    actualizarEstadoSesionUI();
    mostrarToast(`¡Bienvenido, ${currentUsername}! Token JWT generado`, 'success');
    loginForm.reset();
  } else {
    mostrarToast(data.error || data.mensaje || 'Credenciales inválidas', 'error');
  }
}

function cerrarSesion() {
  authToken = null;
  currentUsername = null;
  localStorage.removeItem('jwt_token');
  localStorage.removeItem('jwt_user');

  actualizarEstadoSesionUI();
  mostrarToast('Sesión cerrada correctamente', 'success');
}

async function validarPerfilToken() {
  if (!authToken) {
    mostrarToast('No hay token JWT activo', 'error');
    return;
  }

  const { ok, data } = await realizarPeticion('GET', '/auth/perfil');
  if (ok) {
    mostrarToast('Token verificado: acceso autorizado a ruta protegida', 'success');
  } else {
    mostrarToast('El token no es válido o ha expirado', 'error');
  }
}

function actualizarEstadoSesionUI() {
  if (authToken && currentUsername) {
    sessionStatus.textContent = currentUsername;
    sessionStatus.style.color = 'var(--accent-green)';
    authActiveUser.style.display = 'flex';
    loggedUsername.textContent = currentUsername;
    tokenBox.style.display = 'block';
    tokenValue.textContent = authToken;
  } else {
    sessionStatus.textContent = 'No autenticado';
    sessionStatus.style.color = 'var(--text-muted)';
    authActiveUser.style.display = 'none';
    tokenBox.style.display = 'none';
    tokenValue.textContent = '';
  }
}

/**
 * Evitar inyecciones XSS en el HTML
 */
function escapeHtml(texto) {
  return String(texto)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
