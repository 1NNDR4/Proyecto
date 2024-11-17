CREATE DATABASE IF NOT EXISTS Proyecto;
USE Proyecto;

-- Tabla de Usuario
CREATE TABLE IF NOT EXISTS Usuario (
    usuario_id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    contraseña VARCHAR(255) NOT NULL,
    tipo_usuario ENUM('admin', 'usuario') DEFAULT 'usuario',
    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de Evento
CREATE TABLE IF NOT EXISTS Evento (
    evento_id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(200) NOT NULL,
    descripcion TEXT,
    fecha DATETIME NOT NULL,
    lugar VARCHAR(255)
);

-- Tabla de Notificacion
CREATE TABLE IF NOT EXISTS Notificacion (
    notificacion_id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT,
    evento_id INT,
    mensaje TEXT,
    fecha DATETIME DEFAULT CURRENT_TIMESTAMP,
    leido BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (usuario_id) REFERENCES Usuario(usuario_id) ON DELETE CASCADE,
    FOREIGN KEY (evento_id) REFERENCES Evento(evento_id) ON DELETE CASCADE
);

-- Tabla de Denuncia
CREATE TABLE IF NOT EXISTS Denuncia (
    denuncia_id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT,
    descripcion TEXT,
    fecha DATETIME DEFAULT CURRENT_TIMESTAMP,
    estado ENUM('pendiente', 'resuelta') DEFAULT 'pendiente',
    FOREIGN KEY (usuario_id) REFERENCES Usuario(usuario_id) ON DELETE CASCADE
);

-- Tabla de Noticia
CREATE TABLE IF NOT EXISTS Noticia (
    noticia_id INT AUTO_INCREMENT PRIMARY KEY,
    titulo VARCHAR(200) NOT NULL,
    contenido TEXT NOT NULL,
    fecha_publicacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    fuente VARCHAR(100),
    url VARCHAR(255)
);


CREATE INDEX idx_evento_fecha ON Evento(fecha);
CREATE INDEX idx_notificacion_fecha ON Notificacion(fecha);
CREATE INDEX idx_denuncia_fecha ON Denuncia(fecha);

select * from Usuario;

UPDATE Usuario
SET tipo_usuario = 'admin'
WHERE email = 'harrisonhernandezp@gmail.com';  -- Reemplaza con el email del usuario


ALTER TABLE Usuario 
ADD COLUMN tipo_usuario ENUM('admin', 'usuario') DEFAULT 'usuario';

drop database Proyecto;
