import mongoose from "mongoose";

const comentarioSchema = new mongoose.Schema({

    Usuario:{
        type: mongoose.Schema.Types.ObjectId,
        ref:"InicioSesion",
        required:true
    },

    Proyecto:{
        type: mongoose.Schema.Types.ObjectId,
        ref:"artWork",
        required:true
    },

    comentario:{
        type:String,
        required:true,
        trim:true,
        maxlength:500
    }

},{
    timestamps:true
});

export default mongoose.model("Comentario", comentarioSchema);