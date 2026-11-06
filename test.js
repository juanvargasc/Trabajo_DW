const test = require('node:test');
const assert = require('node:assert/strict');
const app = require('./server');
const database = require('./src/config/database');
const Persona = require('./src/models/Persona');
const Usuario = require('./src/models/Usuario');

let server;
let baseUrl;
let isMysqlOnline = false;

test.before(async () => {
  // Intentar conectar con la base de datos MySQL
  isMysqlOnline = await database.init();

  if (isMysqlOnline) {
    // Limpiar registros de prueba si MySQL está disponible
    try {
      await database.query('DELETE FROM personas WHERE identificacion IN ("1001", "1002")');
      await database.query('DELETE FROM usuarios WHERE username = "estudiante"');
    } catch (e) {
      // Ignorar si las tablas aún no tienen esos datos
    }
  }

  await new Promise((resolve) => {
    server = app.listen(0, () => {
      const port = server.address().port;
      baseUrl = `http://localhost:${port}`;
      resolve();
    });
  });
});

test.after(async () => {
  if (isMysqlOnline) {
    try {
      await database.query('DELETE FROM personas WHERE identificacion IN ("1001", "1002")');
      await database.query('DELETE FROM usuarios WHERE username = "estudiante"');
      await database.close();
    } catch (e) {}
  }
  if (server) {
    await new Promise((resolve) => server.close(resolve));
  }
});

// ----------------- PRUEBAS UNITARIAS DE MODELOS (POO) -----------------

test('A. MODELO POO: Persona valida datos requeridos y tipos', () => {
  // Valida campos obligatorios
  const sinId = Persona.validarCreacion({ nombre: 'Juan', edad: 20 });
  assert.equal(sinId.valido, false);

  const sinNombre = Persona.validarCreacion({ identificacion: '123', edad: 20 });
  assert.equal(sinNombre.valido, false);

  const edadInvalida = Persona.validarCreacion({ identificacion: '123', nombre: 'Juan', edad: -5 });
  assert.equal(edadInvalida.valido, false);

  // Instancia válida
  const p = new Persona('1001', 'Juan Pérez', 25);
  assert.equal(p.identificacion, '1001');
  assert.equal(p.nombre, 'Juan Pérez');
  assert.equal(p.edad, 25);
  assert.deepEqual(p.toJSON(), { identificacion: '1001', nombre: 'Juan Pérez', edad: 25 });
});

test('B. MODELO POO: Usuario valida datos y encripta con bcrypt', async () => {
  const sinUser = Usuario.validarRegistro({ password: '123' });
  assert.equal(sinUser.valido, false);

  const passCorta = Usuario.validarRegistro({ username: 'carlos', password: '12' });
  assert.equal(passCorta.valido, false);

  const hash = await Usuario.hashPassword('clave1234');
  assert.ok(hash.startsWith('$2'));

  const user = new Usuario('1', 'carlos', hash);
  assert.equal(user.username, 'carlos');
  const correcta = await user.verificarPassword('clave1234');
  assert.equal(correcta, true);
  const incorrecta = await user.verificarPassword('claveErronea');
  assert.equal(incorrecta, false);
});

// ----------------- PRUEBAS DE INTEGRACIÓN CON MYSQL -----------------

test('1. GET /personas retorna código 200 y formato de lista', async (t) => {
  if (!isMysqlOnline) {
    t.skip('Requiere servidor MySQL encendido (ej. XAMPP)');
    return;
  }
  const res = await fetch(`${baseUrl}/personas`);
  assert.equal(res.status, 200);
  const data = await res.json();
  assert.ok(Array.isArray(data.data));
});

test('2. POST /personas registra una nueva persona en MySQL', async (t) => {
  if (!isMysqlOnline) {
    t.skip('Requiere servidor MySQL encendido (ej. XAMPP)');
    return;
  }
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

test('3. POST /personas rechaza identificación duplicada en MySQL', async (t) => {
  if (!isMysqlOnline) {
    t.skip('Requiere servidor MySQL encendido (ej. XAMPP)');
    return;
  }
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
  // Validación de controlador sin requerir MySQL
  const resSinNombre = await fetch(`${baseUrl}/personas`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identificacion: '1002', edad: 20 })
  });
  assert.equal(resSinNombre.status, 400);

  const resEdadInvalida = await fetch(`${baseUrl}/personas`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identificacion: '1002', nombre: 'Carlos', edad: -5 })
  });
  assert.equal(resEdadInvalida.status, 400);

  const resSinId = await fetch(`${baseUrl}/personas`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nombre: 'Carlos', edad: 22 })
  });
  assert.equal(resSinId.status, 400);
});

test('5. GET /personas/:identificacion obtiene persona existente', async (t) => {
  if (!isMysqlOnline) {
    t.skip('Requiere servidor MySQL encendido');
    return;
  }
  const res = await fetch(`${baseUrl}/personas/1001`);
  assert.equal(res.status, 200);
  const body = await res.json();
  assert.equal(body.data.nombre, 'Ana Gómez');
  assert.equal(body.data.identificacion, '1001');
});

test('6. GET /personas/:identificacion responde 404 para persona inexistente', async (t) => {
  if (!isMysqlOnline) {
    t.skip('Requiere servidor MySQL encendido');
    return;
  }
  const res = await fetch(`${baseUrl}/personas/9999`);
  assert.equal(res.status, 404);
});

test('7. PUT /personas/:identificacion actualiza datos en MySQL', async (t) => {
  if (!isMysqlOnline) {
    t.skip('Requiere servidor MySQL encendido');
    return;
  }
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

test('8. GET /personas/nombre/:nombre filtra por nombre (parámetro de ruta)', async (t) => {
  if (!isMysqlOnline) {
    t.skip('Requiere servidor MySQL encendido');
    return;
  }
  const res = await fetch(`${baseUrl}/personas/nombre/Ana`);
  assert.equal(res.status, 200);
  const body = await res.json();
  assert.ok(body.total >= 1);
  assert.equal(body.data[0].identificacion, '1001');

  const resNoExiste = await fetch(`${baseUrl}/personas/nombre/Desconocido`);
  assert.equal(resNoExiste.status, 404);
});

test('9. GET /personas?nombre=... filtra por nombre (query param)', async (t) => {
  if (!isMysqlOnline) {
    t.skip('Requiere servidor MySQL encendido');
    return;
  }
  const res = await fetch(`${baseUrl}/personas?nombre=maría`);
  assert.equal(res.status, 200);
  const body = await res.json();
  assert.ok(body.total >= 1);
  assert.equal(body.data[0].nombre, 'Ana María Gómez');
});

test('10. DELETE /personas/:identificacion elimina la persona de MySQL', async (t) => {
  if (!isMysqlOnline) {
    t.skip('Requiere servidor MySQL encendido');
    return;
  }
  const res = await fetch(`${baseUrl}/personas/1001`, {
    method: 'DELETE'
  });
  assert.equal(res.status, 200);

  const resCheck = await fetch(`${baseUrl}/personas/1001`);
  assert.equal(resCheck.status, 404);
});

test('11. AUTH: Registro de usuario encripta con bcrypt en MySQL', async (t) => {
  if (!isMysqlOnline) {
    t.skip('Requiere servidor MySQL encendido');
    return;
  }
  const res = await fetch(`${baseUrl}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'estudiante', password: 'passwordSeguro123' })
  });
  assert.equal(res.status, 201);
  const body = await res.json();
  assert.equal(body.data.username, 'estudiante');

  const resDup = await fetch(`${baseUrl}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'estudiante', password: 'otraPassword' })
  });
  assert.equal(resDup.status, 409);
});

test('12. AUTH: Login valida contraseña encriptada y genera JWT', async (t) => {
  if (!isMysqlOnline) {
    t.skip('Requiere servidor MySQL encendido');
    return;
  }
  const resOk = await fetch(`${baseUrl}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'estudiante', password: 'passwordSeguro123' })
  });
  assert.equal(resOk.status, 200);
  const dataOk = await resOk.json();
  assert.ok(dataOk.token);

  const resPerfil = await fetch(`${baseUrl}/auth/perfil`, {
    headers: { Authorization: `Bearer ${dataOk.token}` }
  });
  assert.equal(resPerfil.status, 200);

  const resSinToken = await fetch(`${baseUrl}/auth/perfil`);
  assert.equal(resSinToken.status, 401);
});
