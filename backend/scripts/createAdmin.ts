import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
import * as bcryptjs from 'bcryptjs';
import InicioSesion from '../src/models/Inicio_sesion.js';

async function createAdmin() {
  // Cargar variables de entorno
  dotenv.config();

  // Conectarse a MongoDB
  const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/pixelart';
  
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Conectado a MongoDB');

    // Verificar si ya existe un usuario con email admin@pixelart.com
    const existingAdmin = await InicioSesion.findOne({ correo: 'admin@pixelart.com' });
    
    if (existingAdmin) {
      console.log('El usuario admin ya existe en la base de datos');
      await mongoose.disconnect();
      process.exit(0);
    }

    // Hashear contraseña predeterminada
    const passwordPlain = 'admin123';
    const hashedPassword = await bcryptjs.hash(passwordPlain, 10);

    // Crear nuevo usuario admin
    const newAdmin = new InicioSesion({
      username: 'admin',
      Nombre: 'Administrador',
      Usuario: 'admin',
      password: hashedPassword,
      correo: 'admin@pixelart.com',
      role: 'admin'
    });

    await newAdmin.save();
    console.log('Usuario admin creado exitosamente');
    console.log('Email: admin@pixelart.com');
    console.log('Contraseña: admin123');
    console.log('Role: admin');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Error al crear el usuario admin:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

createAdmin();
