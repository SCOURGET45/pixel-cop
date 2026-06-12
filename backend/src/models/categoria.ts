import mongoose from "mongoose";

const categoriaSchema = new mongoose.Schema({

    nombre:{
        type:String,
        required:true,
        unique:true,
        trim:true
    },

    descripcion:{
        type:String,
        trim:true
    }

});

export default mongoose.model("Categoria", categoriaSchema);