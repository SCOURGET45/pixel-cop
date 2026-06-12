import mongoose from "mongoose";

const portafolioSchema = new mongoose.Schema({

    Usuario:{
        type: mongoose.Schema.Types.ObjectId,
        ref:"InicioSesion",
        required:true
    },

    descripcion:{
        type:String
    }

});

export default mongoose.model("Portafolio", portafolioSchema);