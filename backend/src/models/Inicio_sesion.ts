import mongoose from "mongoose";

const InicioSesionSchema = new mongoose.Schema({

  idUsuario: {
    type: String,
    match: /^[a-zA-Z0-9]+$/ // solo letras y números
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
    requiered: true,
    match: /^[A-Z0-9-]+$/ // letras, números y guiones
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
  }

},
{
  timestamps: true
});

export default mongoose.model("InicioSesion", InicioSesionSchema);