import mongoose from "mongoose";

const publicacionSchema = new mongoose.Schema({

    Proyecto:{
        type: mongoose.Schema.Types.ObjectId,
        ref:"artWork",
        required:true
    },

    Usuario:{
        type: mongoose.Schema.Types.ObjectId,
        ref:"InicioSesion",
        required:true
    },

    titulo:{
        type:String,
        required:true
    },

    descripcion:{
        type:String
    },

    estado:{
        type:String,
        enum:["publicado","oculto"],
        default:"publicado"
    }

},{
    timestamps:true
});

export default mongoose.model("Publicacion", publicacionSchema);