# Servidor con Base de Datos MySQL - Gestión de Personas (MVC y POO)

Servidor backend desarrollado en **Node.js** y **Express** con persistencia en **MySQL / MariaDB**, estructurado bajo el patrón de arquitectura **MVC (Modelo - Vista - Controlador)** y los principios de **POO (Programación Orientada a Objetos)**.

Permite gestionar registros de personas en una base de datos relacional y cuenta con un sistema de autenticación con contraseñas encriptadas mediante **bcryptjs** y tokens **JWT (JSON Web Tokens)**.

---

## 📋 Características

* **Arquitectura MVC y POO**: Código modular organizado en Modelos, Controladores, Rutas y Vistas, con clases, encapsulamiento y el patrón *Repository*.
* **Persistencia Relacional en MySQL**:
  * Manejo de conexiones mediante Connection Pool optimizado (`mysql2/promise`).
  * Creación automática de la base de datos `gestion_personas` y sus tablas al arrancar el servidor.
* **CRUD de Personas en Base de Datos**:
  * **`identificacion`**: Identificador único (Clave primaria VARCHAR).
  * **`nombre`**: Nombre completo (VARCHAR).
  * **`edad`**: Edad (número entero $\ge 0$).
* **Filtros de Búsqueda SQL**: Búsqueda por ID exacto y filtrado con cláusula `LIKE` por coincidencia de nombre (vía parámetro de ruta o query param).
* **Autenticación y Seguridad**:
  * Registro de usuarios con hashing seguro de contraseñas mediante **bcryptjs** (salt rounds = 10).
  * Inicio de sesión con emisión de tokens **JWT** (expiración de 2 horas).
  * Middleware para protección de rutas mediante encabezado `Authorization: Bearer <token>`.
* **Interfaz Web (Vista)**: Panel interactivo en HTML5, CSS3 y JavaScript vanilla para interactuar con la base de datos en tiempo real.
* **Pruebas Automatizadas**: Suite completa de tests unitarios y de integración usando el ejecutor nativo de Node.js (`node:test`).

---

## 🚀 Requisitos Previos

* [Node.js](https://nodejs.org/) (versión 18 o superior recomendada).
* **MySQL** o **MariaDB** (por ejemplo, a través de [XAMPP](https://www.apachefriends.org/es/index.html), WampServer o Docker).

---

## 📦 Instalación y Configuración

1. **Instalar dependencias del proyecto:**
   ```bash
   npm install
   ```

2. **Configuración de Variables de Entorno (`.env`):**
   El proyecto incluye un archivo `.env` configurado por defecto para XAMPP:
   ```env
   PORT=3000
   JWT_SECRET=secreto_super_seguro_para_jwt_token_2026

   # Conexión a MySQL
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=
   DB_NAME=gestion_personas
   DB_PORT=3306
   ```

3. **Base de Datos:**
   El servidor ejecuta automáticamente las sentencias de inicialización (`CREATE DATABASE IF NOT EXISTS` y `CREATE TABLE IF NOT EXISTS`) al iniciar.
   También dispones del archivo [`schema.sql`](file:///c:/Users/pcgam/Documents/U/2do%20semestre/Dise%C3%B1oWeb/reto/schema.sql) si deseas importarlo manualmente desde phpMyAdmin o MySQL Workbench.

---

## ▶️ Ejecución del Servidor

1. Asegúrate de tener iniciado el servicio de **MySQL** (por ejemplo, dando clic en **Start** en el módulo MySQL del panel de XAMPP).
2. Inicia el servidor:
   ```bash
   npm start
   ```
   O en modo desarrollo con recarga automática:
   ```bash
   npm run dev
   ```

3. Abre en tu navegador:
   👉 **`http://localhost:3000`**

---

## 🧪 Ejecutar Pruebas Automatizadas

```bash
npm test
```

* Si MySQL está encendido, ejecutará las pruebas de integración directamente sobre la base de datos.
* Si MySQL no está encendido, ejecutará las pruebas unitarias de los modelos POO e indicará el estado de la conexión.

---

## 📡 Documentación de la API REST

Todas las rutas de personas están disponibles en `/personas` y `/api/personas`. Las rutas de autenticación están en `/auth` y `/api/auth`.

### 🔐 1. Autenticación (Auth)

| Método | Ruta | Descripción |
| :--- | :--- | :--- |
| `POST` | `/auth/register` | Registra usuario y guarda la contraseña con hash bcrypt en MySQL |
| `POST` | `/auth/login` | Valida credenciales contra MySQL y genera un token JWT |
| `GET` | `/auth/perfil` | Ruta protegida (requiere header `Authorization: Bearer <token>`) |

### 👥 2. Gestión de Personas

| Método | Ruta | Descripción |
| :--- | :--- | :--- |
| `GET` | `/personas` | Obtiene todas las personas de la tabla `personas` |
| `GET` | `/personas?nombre=Carlos` | Filtra personas por nombre usando query param (`LIKE %nombre%`) |
| `GET` | `/personas/nombre/:nombre` | Filtra personas por nombre usando parámetro de ruta |
| `GET` | `/personas/:identificacion` | Consulta una persona específica por su clave primaria |
| `POST` | `/personas` | Inserta una nueva persona en MySQL (valida duplicados y tipos) |
| `PUT` | `/personas/:identificacion` | Actualiza nombre y/o edad de la persona en MySQL |
| `DELETE` | `/personas/:identificacion` | Elimina a la persona de la tabla en MySQL |

---

## 📁 Arquitectura del Proyecto (MVC + POO + MySQL)

```
reto/
├── src/
│   ├── config/
│   │   └── database.js           # POO: Pool de conexiones MySQL y auto-inicialización DDL
│   ├── models/                   # MODELO (M)
│   │   ├── Persona.js            # POO: Entidad Persona con validaciones y encapsulamiento
│   │   ├── PersonaRepository.js  # POO: Repositorio con consultas SQL (SELECT, INSERT, UPDATE, DELETE)
│   │   ├── Usuario.js            # POO: Entidad Usuario con hashing y verificación bcrypt
│   │   └── UsuarioRepository.js  # POO: Repositorio de usuarios con persistencia en MySQL
│   ├── controllers/              # CONTROLADOR (C)
│   │   ├── PersonaController.js  # Métodos asíncronos para CRUD de personas
│   │   └── AuthController.js     # Métodos de autenticación (registro, login y perfil)
│   ├── middlewares/
│   │   └── auth.middleware.js    # Verificación de tokens JWT (Bearer)
│   ├── routes/
│   │   ├── persona.routes.js     # Enrutador para /personas
│   │   └── auth.routes.js        # Enrutador para /auth
│   └── app.js                    # Clase App: configuración de Express y servidor
├── public/                       # VISTA (V) - Interfaz Web de Usuario
│   ├── index.html                # Panel de control web
│   ├── styles.css                # Estilos responsivos
│   └── app.js                    # Cliente JS para consumir la API
├── server.js                     # Punto de entrada principal (instancia la clase App)
├── schema.sql                    # Script SQL DDL de la base de datos y tablas
├── .env                          # Configuración de variables de entorno y MySQL
├── .env.example                  # Plantilla de variables de entorno
├── test.js                       # Pruebas automatizadas de integración
├── package.json                  # Dependencias (express, mysql2, bcryptjs, jsonwebtoken, cors, dotenv)
└── README.md                     # Documentación completa del proyecto
```
