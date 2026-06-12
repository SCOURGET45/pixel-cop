import mongoose from "mongoose";

// Interfaz para el modelo de usuario
export interface IUser {
  idUsuario?: string;
  Nombre?: string;
  Usuario?: string;
  password: string;
  correo?: string;
  imgPerfil?: string;
  role: 'user' | 'mod' | 'admin';
}

const InicioSesionSchema = new mongoose.Schema<IUser>({

  idUsuario: {
    type: String,
    trim: true,
    maxlength: 30
  },

  Nombre: {
    type: String,
    trim: true,
    maxlength: 30
   },

   Usuario: {
    type: String,
    trim: true,
    maxlength: 30
   },

  password: {
    type: String,
    required: true,
    minlength: 6,
    maxlength: 50
  },
   
  correo: {
    type: String,
    trim: true,
    maxlength: 30
  },

   imgPerfil: {
    type: String,
    trim: true,
    maxlength: 30
  },
  
  role: {
    type: String,
    enum: ['user', 'mod', 'admin'],
    default: 'user'
  }

},
{
  timestamps: true,
  collection: 'iniciosesions'
});

export default mongoose.model("InicioSesion", InicioSesionSchema);