import mongoose from "mongoose";

const paletaColoresSchema = new mongoose.Schema({

name:{
    type: String,
    requiered: true,
    trim: true,
    maxlength: 50
},

description:{
    type: String,
    trim: true,
    maxlength: 200
},

colors:{
    type: [String],
    requiered: true,
    validate:{
        validator: function(v: string[]){
            return v.length > 0 && v.every(color => /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color));
        },
        message: 'El array de colores deebe contener codigos Hexadecimales validos'
    }
},

    Usuario: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "InicioSesion",
       requiered: true
  },

  isPublic:{
    type:Boolean,
    default: false
  }

},
{
  timestamps: true
});

export default mongoose.model("paletaColores", paletaColoresSchema);