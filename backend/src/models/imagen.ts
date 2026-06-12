import mongoose from "mongoose";

const imagenSchema = new mongoose.Schema({

    Proyecto:{
        type: mongoose.Schema.Types.ObjectId,
        ref:"artWork",
        required:true
    },

    url:{
        type:String,
        required:true
    },

    nombre:{
        type:String
    }

},{
    timestamps:true
});

export default mongoose.model("Imagen", imagenSchema);