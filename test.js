const test = require('node:test');
const assert = require('node:assert/strict');
const app = require('./server');

let server;
let baseUrl;

test.before(async () => {
  await new Promise((resolve) => {
    server = app.listen(0, () => {
      const port = server.address().port;
      baseUrl = `http://localhost:${port}`;
      resolve();
    });
  });
});

test.after(async () => {
  await new Promise((resolve) => server.close(resolve));
});

test('1. GET /personas retorna lista vacía inicialmente', async () => {
  const res = await fetch(`${baseUrl}/personas`);
  assert.equal(res.status, 200);
  const data = await res.json();
  assert.equal(data.total, 0);
  assert.deepEqual(data.data, []);
});

test('2. POST /personas registra una nueva persona', async () => {
  const persona = {
    identificacion: '1001',
    nombre: 'Ana Gómez',
    edad: 28
  };

  const res = await fetch(`${baseUrl}/personas`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(persona)
  });

  assert.equal(res.status, 201);
  const body = await res.json();
  assert.equal(body.data.identificacion, '1001');
  assert.equal(body.data.nombre, 'Ana Gómez');
  assert.equal(body.data.edad, 28);
});

test('3. POST /personas rechaza identificación duplicada', async () => {
  const persona = {
    identificacion: '1001',
    nombre: 'Ana Duplicada',
    edad: 30
  };

  const res = await fetch(`${baseUrl}/personas`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(persona)
  });

  assert.equal(res.status, 409);
  const body = await res.json();
  assert.match(body.error, /duplicada/i);
});

test('4. POST /personas valida campos requeridos y tipos', async () => {
  // Falta nombre
  const resSinNombre = await fetch(`${baseUrl}/personas`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identificacion: '1002', edad: 20 })
  });
  assert.equal(resSinNombre.status, 400);

  // Edad negativa
  const resEdadInvalida = await fetch(`${baseUrl}/personas`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identificacion: '1002', nombre: 'Carlos', edad: -5 })
  });
  assert.equal(resEdadInvalida.status, 400);

  // Falta identificación
  const resSinId = await fetch(`${baseUrl}/personas`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nombre: 'Carlos', edad: 22 })
  });
  assert.equal(resSinId.status, 400);
});

test('5. GET /personas/:identificacion obtiene persona existente', async () => {
  const res = await fetch(`${baseUrl}/personas/1001`);
  assert.equal(res.status, 200);
  const body = await res.json();
  assert.equal(body.data.nombre, 'Ana Gómez');
  assert.equal(body.data.identificacion, '1001');
});

test('6. GET /personas/:identificacion responde 404 para persona inexistente', async () => {
  const res = await fetch(`${baseUrl}/personas/9999`);
  assert.equal(res.status, 404);
});

test('7. PUT /personas/:identificacion actualiza datos', async () => {
  const res = await fetch(`${baseUrl}/personas/1001`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nombre: 'Ana María Gómez', edad: 29 })
  });
  assert.equal(res.status, 200);
  const body = await res.json();
  assert.equal(body.data.nombre, 'Ana María Gómez');
  assert.equal(body.data.edad, 29);
});

test('8. GET /personas/nombre/:nombre filtra por nombre (parámetro de ruta)', async () => {
  const res = await fetch(`${baseUrl}/personas/nombre/Ana`);
  assert.equal(res.status, 200);
  const body = await res.json();
  assert.equal(body.total, 1);
  assert.equal(body.data[0].identificacion, '1001');

  // Caso no encontrado
  const resNoExiste = await fetch(`${baseUrl}/personas/nombre/Desconocido`);
  assert.equal(resNoExiste.status, 404);
});

test('9. GET /personas?nombre=... filtra por nombre (query param)', async () => {
  const res = await fetch(`${baseUrl}/personas?nombre=maría`);
  assert.equal(res.status, 200);
  const body = await res.json();
  assert.equal(body.total, 1);
  assert.equal(body.data[0].nombre, 'Ana María Gómez');
});

test('10. DELETE /personas/:identificacion elimina la persona', async () => {
  const res = await fetch(`${baseUrl}/personas/1001`, {
    method: 'DELETE'
  });
  assert.equal(res.status, 200);

  // Confirmar que ya no existe
  const resCheck = await fetch(`${baseUrl}/personas/1001`);
  assert.equal(resCheck.status, 404);

  // Confirmar lista vacía de nuevo
  const resLista = await fetch(`${baseUrl}/personas`);
  const data = await resLista.json();
  assert.equal(data.total, 0);
});

test('11. AUTH: Registro de usuario encripta con bcrypt y rechaza duplicados', async () => {
  // Registro exitoso
  const res = await fetch(`${baseUrl}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'estudiante', password: 'passwordSeguro123' })
  });
  assert.equal(res.status, 201);
  const body = await res.json();
  assert.equal(body.data.username, 'estudiante');

  // Rechazar duplicado
  const resDup = await fetch(`${baseUrl}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'estudiante', password: 'otraPassword' })
  });
  assert.equal(resDup.status, 409);
});

test('12. AUTH: Login genera JWT y valida contraseña encriptada', async () => {
  // Login con contraseña correcta
  const resOk = await fetch(`${baseUrl}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'estudiante', password: 'passwordSeguro123' })
  });
  assert.equal(resOk.status, 200);
  const dataOk = await resOk.json();
  assert.ok(dataOk.token);
  assert.equal(dataOk.usuario.username, 'estudiante');

  // Login con contraseña incorrecta
  const resMal = await fetch(`${baseUrl}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'estudiante', password: 'claveIncorrecta' })
  });
  assert.equal(resMal.status, 401);

  // Probar ruta protegida con el JWT obtenido
  const resPerfil = await fetch(`${baseUrl}/auth/perfil`, {
    headers: { Authorization: `Bearer ${dataOk.token}` }
  });
  assert.equal(resPerfil.status, 200);
  const perfilData = await resPerfil.json();
  assert.equal(perfilData.usuario.username, 'estudiante');

  // Probar ruta protegida sin token
  const resSinToken = await fetch(`${baseUrl}/auth/perfil`);
  assert.equal(resSinToken.status, 401);
});

