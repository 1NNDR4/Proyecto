// Importación de dependencias
const mysql = require('mysql2/promise'); // Librería para conectarse a MySQL de forma asíncrona
const express = require('express'); // Framework para construir aplicaciones web
const jwt = require('jsonwebtoken'); // Librería para manejar JSON Web Tokens
const bodyParser = require('body-parser'); // Middleware para parsear el cuerpo de las solicitudes
const bcrypt = require('bcrypt'); // Librería para encriptar y verificar contraseñas
const cors = require('cors'); // Middleware para habilitar CORS (Cross-Origin Resource Sharing)

require('dotenv').config(); // Cargar variables de entorno desde un archivo .env

// Inicialización de la aplicación Express
const app = express();
app.use(cors()); // Habilitar CORS

// Configuración del archivo .env
const result = require('dotenv').config({ path: './server.env' });

if (result.error) {
  console.log('Error cargando el archivo .env:', result.error);
} else {
  console.log('Archivo .env cargado correctamente');
}

// Middleware para procesar las solicitudes HTTP
app.use(bodyParser.json()); // Parsear JSON
app.use(bodyParser.urlencoded({ extended: true })); // Parsear datos de formularios

// Conexión a la base de datos MySQL usando un pool de conexiones
const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  port: 3306,
  database: process.env.DB_NAME
});

// Verificar la conexión a la base de datos
db.getConnection()
  .then(connection => {
    console.log("Conexión a MySQL establecida.");
    connection.release();
  })
  .catch(error => {
    console.error("Ha ocurrido un error en la conexión:", error);
  });

// Middleware de autenticación de tokens JWT
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization']; // Obtener el encabezado de autorización
  const token = authHeader && authHeader.split(' ')[1]; // Obtener el token

  if (!token) {
    return res.status(401).json({ message: 'Acceso denegado, token no proporcionado' });
  }

  // Verificar la validez del token
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Token inválido o expirado' });
    }
    req.user = user; // Almacenar el usuario en la solicitud
    next(); // Continuar con la siguiente función de middleware
  });
};

// Middleware para validar los datos de registro
const validateRegisterData = (req, res, next) => {
  const { nombre, apellido, email, contraseña } = req.body;

  // Verificar que todos los campos estén presentes
  if (!nombre || !apellido || !email || !contraseña) {
    return res.status(400).json({ message: 'Todos los campos son obligatorios' });
  }

  // Validar el formato del correo electrónico
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ message: 'El formato del correo electrónico no es válido' });
  }

  next(); // Continuar con la siguiente función de middleware
};

// Ruta para registrar un nuevo usuario
app.post('/register', validateRegisterData, async (req, res) => {
  const { nombre, apellido, email, contraseña } = req.body;

  try {
    // Verificar si el correo electrónico ya está registrado
    const [results] = await db.query('SELECT * FROM Usuario WHERE email = ?', [email]);
    if (results.length > 0) {
      return res.status(400).json({ message: 'El email ya está registrado' });
    }

    // Encriptar la contraseña
    const hashedPassword = await bcrypt.hash(contraseña, 10);

    // Insertar el nuevo usuario en la base de datos
    await db.query(
      'INSERT INTO Usuario (nombre, apellido, email, contraseña, tipo_usuario) VALUES (?, ?, ?, ?, ?)',
      [nombre, apellido, email, hashedPassword, 'usuario']
    );

    res.status(201).json({ message: 'Usuario registrado con éxito' });
  } catch (err) {
    res.status(500).json({ message: 'Error en el servidor', error: err });
  }
});

// Ruta para iniciar sesión de un usuario
app.post('/login', async (req, res) => {
  const { email, contraseña } = req.body;

  try {
    // Buscar el usuario en la base de datos por su correo electrónico
    const [results] = await db.query('SELECT * FROM Usuario WHERE email = ?', [email]);

    // Si no se encuentra el usuario, devolver error
    if (results.length === 0) {
      return res.status(401).json({ message: 'Email o contraseña incorrectos' });
    }

    const user = results[0];

    // Verificar si la contraseña es correcta
    const match = await bcrypt.compare(contraseña, user.contraseña);
    if (!match) {
      return res.status(401).json({ message: 'Email o contraseña incorrectos' });
    }

    // Generar un token JWT para el usuario
    const token = jwt.sign(
      { usuario_id: user.usuario_id, email: user.email, tipo_usuario: user.tipo_usuario },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({
      message: 'Inicio de sesión exitoso',
      token,
      tipo_usuario: user.tipo_usuario
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error en el servidor', error: err.message });
  }
});

// Ruta para obtener los usuarios (solo los que no son administradores)
app.get('/usuarios', authenticateToken, async (req, res) => {
  try {
    const [results] = await db.query('SELECT usuario_id, nombre, apellido, email, tipo_usuario FROM Usuario WHERE tipo_usuario != "admin"');
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener los usuarios' });
  }
});

// Ruta para obtener todos los eventos
app.get('/eventos', authenticateToken, async (req, res) => {
  try {
    const [results] = await db.query('SELECT evento_id, nombre, fecha, descripcion, lugar FROM Evento');
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener eventos' });
  }
});

// Ruta para obtener todas las notificaciones
app.get('/notificaciones', authenticateToken, async (req, res) => {
  try {
    const [results] = await db.query(`
      SELECT n.*, u.nombre AS nombre_usuario, u.apellido AS apellido_usuario, e.nombre AS nombre_evento
      FROM Notificacion n
      JOIN Usuario u ON n.usuario_id = u.usuario_id
      JOIN Evento e ON n.evento_id = e.evento_id
    `);
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener notificaciones' });
  }
});

// Ruta para crear una nueva notificación
app.post('/notificaciones', authenticateToken, async (req, res) => {
  const { usuario_id, evento_id, mensaje } = req.body;
  try {
    const [result] = await db.query(
      'INSERT INTO Notificacion (usuario_id, evento_id, mensaje) VALUES (?, ?, ?)',
      [usuario_id, evento_id, mensaje]
    );
    res.status(201).json({ message: 'Notificación creada', id: result.insertId });
  } catch (error) {
    res.status(500).json({ error: 'Error al crear la notificación' });
  }
});

// Ruta para marcar una notificación como leída
app.put('/notificaciones/:id/read', authenticateToken, async (req, res) => {
  const { id } = req.params;
  try {
    await db.query('UPDATE Notificacion SET leido = TRUE WHERE notificacion_id = ?', [id]);
    res.json({ message: 'Notificación marcada como leída' });
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar la notificación' });
  }
});

// Ruta para eliminar una notificación
app.delete('/notificaciones/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  try {
    await db.query('DELETE FROM Notificacion WHERE notificacion_id = ?', [id]);
    res.json({ message: 'Notificación eliminada' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar la notificación' });
  }
});

// Ruta para crear un evento
app.post('/eventos', authenticateToken, async (req, res) => {
  const { nombre, fecha, descripcion, lugar } = req.body;
  try {
    const [result] = await db.query(
      'INSERT INTO Evento (nombre, fecha, descripcion, lugar) VALUES (?, ?, ?, ?)',
      [nombre, fecha, descripcion, lugar]
    );
    res.status(201).json({ message: 'Evento creado', id: result.insertId });
  } catch (error) {
    res.status(500).json({ error: 'Error al crear el evento' });
  }
});

// Ruta para actualizar un evento
app.put('/eventos/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { nombre, fecha, descripcion, lugar } = req.body;
  try {
    await db.query(
      'UPDATE Evento SET nombre = ?, fecha = ?, descripcion = ?, lugar = ? WHERE evento_id = ?',
      [nombre, fecha, descripcion, lugar, id]
    );
    res.json({ message: 'Evento actualizado' });
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar el evento' });
  }
});

// Ruta para eliminar un evento
app.delete('/eventos/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  try {
    await db.query('DELETE FROM Evento WHERE evento_id = ?', [id]);
    res.json({ message: 'Evento eliminado' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar el evento' });
  }
});

// Ruta para obtener todas las denuncias
app.get('/denuncias', authenticateToken, async (req, res) => {
  try {
    const [results] = await db.query(`
      SELECT d.denuncia_id, d.descripcion, d.fecha, d.estado, u.nombre, u.apellido
      FROM Denuncia d
      JOIN Usuario u ON d.usuario_id = u.usuario_id
      ORDER BY d.fecha DESC
    `);
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener las denuncias' });
  }
});

// Ruta para crear una nueva denuncia
app.post('/denuncias', authenticateToken, async (req, res) => {
  const { usuario_id, descripcion, fecha, estado } = req.body;

  if (!usuario_id || !descripcion || !fecha || !estado) {
    return res.status(400).json({ message: 'Faltan datos requeridos' });
  }

  try {
    const [result] = await db.query(
      'INSERT INTO Denuncia (usuario_id, descripcion, fecha, estado) VALUES (?, ?, ?, ?)',
      [usuario_id, descripcion, fecha, estado]
    );
    res.status(201).json({ message: 'Denuncia creada', id: result.insertId });
  } catch (error) {
    res.status(500).json({ error: 'Error al crear la denuncia' });
  }
});

// Ruta para actualizar una denuncia
app.put('/denuncias/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { descripcion, fecha, estado } = req.body;
  try {
    await db.query(
      'UPDATE Denuncia SET descripcion = ?, fecha = ?, estado = ? WHERE denuncia_id = ?',
      [descripcion, fecha, estado, id]
    );
    res.json({ message: 'Denuncia actualizada' });
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar la denuncia' });
  }
});

// Ruta para eliminar una denuncia
app.delete('/denuncias/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  try {
    await db.query('DELETE FROM Denuncia WHERE denuncia_id = ?', [id]);
    res.json({ message: 'Denuncia eliminada' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar la denuncia' });
  }
});

// Configuración del puerto y lanzamiento del servidor
app.listen(3000, () => {
  console.log('Servidor Express en el puerto 3000');
});
