# Servidor en Memoria - Gestión de Personas

Servidor desarrollado en **Node.js** y **Express** que gestiona y almacena registros de personas en la memoria RAM del servidor.

Cada persona cuenta con los siguientes campos:
- **`identificacion`**: Identificador único (Cédula / DNI / ID).
- **`nombre`**: Nombre completo (texto).
- **`edad`**: Edad (número entero $\ge 0$).

---

## 🚀 Requisitos Previos

- [Node.js](https://nodejs.org/) (versión 18 o superior recomendada).

---

## 📦 Instalación

Si no has instalado las dependencias todavía, ejecuta en la terminal dentro de esta carpeta:

```bash
npm install
```

---

## ▶️ Ejecución del Servidor

Para iniciar el servidor en modo normal:
```bash
npm start
```

O si prefieres modo desarrollo con recarga automática:
```bash
npm run dev
```

El servidor quedará disponible en:
👉 **`http://localhost:3000`**

Al ingresar desde cualquier navegador web a `http://localhost:3000`, encontrarás una **interfaz gráfica interactiva** para registrar, listar, buscar, editar y eliminar personas.

---

## 🧪 Ejecutar Pruebas Automatizadas

El proyecto incluye pruebas de integración que validan todos los endpoints:
```bash
npm test
```

---

## 📡 Documentación de la API REST

Los endpoints están disponibles bajo `/personas` y `/api/personas`.

### 1. Obtener todas las personas (o filtrar por nombre)
- **Método:** `GET`
- **Ruta:** `/personas` o `/personas?nombre=Carlos`
- **Respuesta:** `200 OK`

### 2. Filtrar personas por nombre (parámetro de ruta)
- **Método:** `GET`
- **Ruta:** `/personas/nombre/:nombre`
- **Ejemplo:** `GET /personas/nombre/Ana`
- **Respuesta:** `200 OK` con las coincidencias, o `404 Not Found` si no hay coincidencias.

### 3. Registrar una nueva persona
- **Método:** `POST`
- **Ruta:** `/personas`
- **Headers:** `Content-Type: application/json`
- **Cuerpo (JSON):**
```json
{
  "identificacion": "1001",
  "nombre": "Ana Gómez",
  "edad": 28
}
```
- **Respuesta de éxito:** `201 Created`
- **Errores posibles:**
  - `400 Bad Request`: Datos faltantes o tipos incorrectos.
  - `409 Conflict`: Ya existe una persona con esa identificación.

### 3. Obtener una persona por identificación
- **Método:** `GET`
- **Ruta:** `/personas/:identificacion`
- **Ejemplo:** `GET /personas/1001`
- **Respuesta:** `200 OK` si existe, `404 Not Found` si no existe.

### 4. Actualizar una persona
- **Método:** `PUT`
- **Ruta:** `/personas/:identificacion`
- **Ejemplo:** `PUT /personas/1001`
- **Cuerpo (JSON):**
```json
{
  "nombre": "Ana María Gómez",
  "edad": 29
}
```
- **Respuesta:** `200 OK` si fue actualizada, `404 Not Found` si no existe.

### 5. Eliminar una persona
- **Método:** `DELETE`
- **Ruta:** `/personas/:identificacion`
- **Ejemplo:** `DELETE /personas/1001`
- **Respuesta:** `200 OK` con los datos de la persona retirada de la memoria.

---

## 💻 Ejemplos de Consumo con cURL

**Crear una persona:**
```bash
curl -X POST http://localhost:3000/personas \
  -H "Content-Type: application/json" \
  -d '{"identificacion": "10203040", "nombre": "Carlos Mendoza", "edad": 32}'
```

**Consultar todas las personas:**
```bash
curl http://localhost:3000/personas
```

**Consultar por identificación:**
```bash
curl http://localhost:3000/personas/10203040
```

**Eliminar una persona:**
```bash
curl -X DELETE http://localhost:3000/personas/10203040
```

---

## 📁 Estructura del Proyecto

```
reto/
├── package.json       # Configuración y dependencias (express, cors)
├── server.js          # Servidor HTTP con almacenamiento en memoria
├── test.js            # Pruebas automatizadas de la API
├── public/            # Interfaz Web de usuario
│   ├── index.html     # Estructura de la página
│   ├── styles.css     # Estilos modernos y responsivos
│   └── app.js         # Lógica cliente para consumir la API
└── README.md          # Documentación del proyecto
```

