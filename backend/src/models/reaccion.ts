import mongoose from "mongoose";

const reaccionSchema = new mongoose.Schema({

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

    tipo:{
        type:String,
        enum:["like","favorito"],
        default:"like"
    }

},{
    timestamps:true
});

export default mongoose.model("Reaccion", reaccionSchema);