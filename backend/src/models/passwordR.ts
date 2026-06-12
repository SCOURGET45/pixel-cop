import mongoose from "mongoose";

const tokenSchema = new mongoose.Schema({

    Usuario:{
        type: mongoose.Schema.Types.ObjectId,
        ref:"InicioSesion",
        required:true
    },

    token:{
        type:String,
        required:true
    },

    expiracion:{
        type:Date,
        required:true
    }

});

export default mongoose.model("TokenRecuperacion", tokenSchema);