-- ==============================================================
-- Script de Creación de Base de Datos y Tablas - MySQL / MariaDB
-- Proyecto: Servidor de Gestión de Personas con MVC y POO
-- ==============================================================

-- 1. Crear la Base de Datos si no existe
CREATE DATABASE IF NOT EXISTS `gestion_personas`
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE `gestion_personas`;

-- 2. Tabla: personas
-- Almacena la identificación, nombre y edad de cada persona
CREATE TABLE IF NOT EXISTS `personas` (
  `identificacion` VARCHAR(50) NOT NULL,
  `nombre` VARCHAR(120) NOT NULL,
  `edad` INT NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`identificacion`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Tabla: usuarios
-- Almacena los usuarios para autenticación con contraseña encriptada (bcrypt)
CREATE TABLE IF NOT EXISTS `usuarios` (
  `id` VARCHAR(50) NOT NULL,
  `username` VARCHAR(60) NOT NULL UNIQUE,
  `password_hash` VARCHAR(255) NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

