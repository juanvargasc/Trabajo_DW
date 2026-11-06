# Servidor en Memoria - Gestión de Personas con MVC y POO

Servidor backend desarrollado en **Node.js** y **Express** estructurado bajo el patrón de arquitectura **MVC (Modelo - Vista - Controlador)** y los principios de **POO (Programación Orientada a Objetos)**.

Permite gestionar registros de personas en memoria RAM y cuenta con un sistema de autenticación con contraseñas encriptadas con **bcryptjs** y tokens **JWT (JSON Web Tokens)**.

---

## 📋 Características

* **Arquitectura MVC y POO**: Código modular organizado en Modelos, Controladores, Rutas y Vistas, con clases y encapsulamiento.
* **Almacenamiento en Memoria**: Gestión de datos rápida en memoria RAM utilizando el patrón Repositorio.
* **CRUD de Personas**:
  * **`identificacion`**: Identificador único (Cédula / DNI / ID).
  * **`nombre`**: Nombre completo (texto).
  * **`edad`**: Edad (número entero $\ge 0$).
* **Filtros de Búsqueda**: Búsqueda por ID exacto y filtrado por coincidencia de nombre (vía parámetro de ruta o query param).
* **Autenticación y Seguridad**:
  * Registro de usuarios con hashing seguro de contraseñas mediante **bcryptjs** (salt rounds = 10).
  * Inicio de sesión con emisión de tokens **JWT** (expiración de 2 horas).
  * Middleware para protección de rutas mediante encabezado `Authorization: Bearer <token>`.
* **Interfaz Web (Vista)**: Panel interactivo en HTML5, CSS3 y JavaScript vanilla para probar todas las operaciones y visualizar respuestas HTTP en tiempo real.
* **Pruebas Automatizadas**: Suite completa de tests de integración usando el ejecutor nativo de Node.js (`node:test`).

---

## 🚀 Requisitos Previos

* [Node.js](https://nodejs.org/) (versión 18 o superior recomendada).
* `npm` (incluido con Node.js).

---

## 📦 Instalación

Clona o descarga el proyecto e instala las dependencias necesarias:

```bash
npm install
```

Dependencias principales:
* `express`: Framework para creación de servidores web y APIs.
* `cors`: Middleware para habilitar Cross-Origin Resource Sharing.
* `bcryptjs`: Encriptación y hashing seguro de contraseñas.
* `jsonwebtoken`: Generación y verificación de tokens JWT.

---

## ▶️ Ejecución del Servidor

Para iniciar el servidor en modo producción:
```bash
npm start
```

O en modo desarrollo con recarga automática ante cambios:
```bash
npm run dev
```

El servidor estará escuchando en:
👉 **`http://localhost:3000`**

Abre esa URL en tu navegador para interactuar con la **interfaz gráfica**.

---

## 🧪 Ejecutar Pruebas Automatizadas

El proyecto incluye 12 pruebas de integración automatizadas que validan la API de personas y el sistema de autenticación:

```bash
npm test
```

---

## 📡 Documentación de la API REST

Todas las rutas de personas están disponibles tanto en `/personas` como en `/api/personas`. Las rutas de autenticación están disponibles en `/auth` y `/api/auth`.

### 🔐 1. Autenticación (Auth)

#### Registro de Usuario
* **Método:** `POST`
* **Ruta:** `/auth/register`
* **Body (JSON):**
  ```json
  {
    "username": "admin",
    "password": "passwordSeguro123"
  }
  ```
* **Respuesta exitosa (201 Created):**
  ```json
  {
    "mensaje": "Usuario registrado exitosamente con contraseña encriptada",
    "data": {
      "id": "1730923000000",
      "username": "admin"
    }
  }
  ```

#### Inicio de Sesión (Login)
* **Método:** `POST`
* **Ruta:** `/auth/login`
* **Body (JSON):**
  ```json
  {
    "username": "admin",
    "password": "passwordSeguro123"
  }
  ```
* **Respuesta exitosa (200 OK):**
  ```json
  {
    "mensaje": "Autenticación exitosa",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "usuario": {
      "id": "1730923000000",
      "username": "admin"
    }
  }
  ```

#### Perfil Protegido (Validación de Token)
* **Método:** `GET`
* **Ruta:** `/auth/perfil`
* **Headers:** `Authorization: Bearer <TOKEN_JWT>`
* **Respuesta exitosa (200 OK):**
  ```json
  {
    "mensaje": "Acceso autorizado con JWT válido",
    "usuario": {
      "id": "1730923000000",
      "username": "admin"
    }
  }
  ```

---

### 👥 2. Gestión de Personas

#### Obtener todas las personas
* **Método:** `GET`
* **Ruta:** `/personas` (o `/personas?nombre=Carlos` para filtrar por query param)
* **Respuesta (200 OK):**
  ```json
  {
    "total": 1,
    "data": [
      {
        "identificacion": "1001",
        "nombre": "Ana Gómez",
        "edad": 28
      }
    ]
  }
  ```

#### Filtrar personas por nombre (Parámetro de Ruta)
* **Método:** `GET`
* **Ruta:** `/personas/nombre/:nombre`
* **Ejemplo:** `GET /personas/nombre/Ana`
* **Respuesta (200 OK):** Lista de coincidencias. Si no hay, retorna `404 Not Found`.

#### Obtener una persona por identificación
* **Método:** `GET`
* **Ruta:** `/personas/:identificacion`
* **Ejemplo:** `GET /personas/1001`
* **Respuesta (200 OK):**
  ```json
  {
    "data": {
      "identificacion": "1001",
      "nombre": "Ana Gómez",
      "edad": 28
    }
  }
  ```

#### Registrar una nueva persona
* **Método:** `POST`
* **Ruta:** `/personas`
* **Body (JSON):**
  ```json
  {
    "identificacion": "1001",
    "nombre": "Ana Gómez",
    "edad": 28
  }
  ```
* **Respuesta (201 Created):**
  ```json
  {
    "mensaje": "Persona registrada exitosamente en memoria",
    "data": {
      "identificacion": "1001",
      "nombre": "Ana Gómez",
      "edad": 28
    }
  }
  ```
* **Errores comunes:**
  * `400 Bad Request`: Datos incompletos o tipos no válidos.
  * `409 Conflict`: Ya existe una persona con esa identificación.

#### Actualizar una persona
* **Método:** `PUT`
* **Ruta:** `/personas/:identificacion`
* **Ejemplo:** `PUT /personas/1001`
* **Body (JSON):**
  ```json
  {
    "nombre": "Ana María Gómez",
    "edad": 29
  }
  ```
* **Respuesta (200 OK):** Objeto actualizado. Si no existe, retorna `404 Not Found`.

#### Eliminar una persona
* **Método:** `DELETE`
* **Ruta:** `/personas/:identificacion`
* **Ejemplo:** `DELETE /personas/1001`
* **Respuesta (200 OK):** Datos de la persona eliminada. Si no existe, retorna `404 Not Found`.

---

## 💻 Ejemplos con cURL

```bash
# 1. Registrar usuario con contraseña encriptada
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username": "profesor", "password": "miClaveSegura"}'

# 2. Login para obtener token JWT
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "profesor", "password": "miClaveSegura"}'

# 3. Consultar ruta protegida con JWT
curl http://localhost:3000/auth/perfil \
  -H "Authorization: Bearer <TU_TOKEN_JWT>"

# 4. Crear una persona
curl -X POST http://localhost:3000/personas \
  -H "Content-Type: application/json" \
  -d '{"identificacion": "10203040", "nombre": "Carlos Mendoza", "edad": 32}'

# 5. Listar personas
curl http://localhost:3000/personas

# 6. Filtrar por nombre
curl http://localhost:3000/personas/nombre/Carlos

# 7. Buscar por identificación
curl http://localhost:3000/personas/10203040

# 8. Eliminar persona
curl -X DELETE http://localhost:3000/personas/10203040
```

---

## 📁 Arquitectura del Proyecto (MVC + POO)

```
reto/
├── src/
│   ├── models/                   # MODELO (M) - Clases de Dominio y Persistencia
│   │   ├── Persona.js            # Entidad Persona con validaciones y encapsulamiento
│   │   ├── PersonaRepository.js  # Repositorio en memoria para CRUD de personas
│   │   ├── Usuario.js            # Entidad Usuario con hashing y verificación bcrypt
│   │   └── UsuarioRepository.js  # Repositorio en memoria para usuarios registrados
│   ├── controllers/              # CONTROLADOR (C) - Manejo de solicitudes HTTP
│   │   ├── PersonaController.js  # Métodos CRUD y de búsqueda de personas
│   │   └── AuthController.js     # Métodos de registro, login y perfil
│   ├── middlewares/              # Middlewares de aplicación
│   │   └── auth.middleware.js    # Verificación de tokens JWT (Bearer)
│   ├── routes/                   # Definición de Enrutadores Express
│   │   ├── persona.routes.js     # Enrutador para /personas
│   │   └── auth.routes.js        # Enrutador para /auth
│   └── app.js                    # Clase App: configuración de Express y servidor
├── public/                       # VISTA (V) - Interfaz Web de Usuario
│   ├── index.html                # Estructura del panel de control
│   ├── styles.css                # Estilos responsivos y modernos
│   └── app.js                    # Cliente JS para consumir la API REST
├── server.js                     # Punto de entrada principal (instancia la clase App)
├── test.js                       # Pruebas automatizadas de integración
├── package.json                  # Dependencias y scripts del proyecto
└── README.md                     # Documentación completa del proyecto
```
