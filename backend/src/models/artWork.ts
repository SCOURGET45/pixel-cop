import mongoose from "mongoose";

const artWorkSchema = new mongoose.Schema({

    Usuario: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "InicioSesion",
    required: true
  },

  title:{
    type:String,
    requiered: true,
    trim: true,
    maxlength: 500
  },

  description:{
    type: String,
    trim: true,
    maxlength: 500
  },

  tags: [{
    type: String,
    trim: true
  }],
width:{
    type: Number,
    requiered: true
},
height: {
    type: Number,
    requiered: true
},
thumbnailUrl:{
    type:String,
    requiered:true
},
editorDataUrl:{
    type:String,
    requiered:true
},
isPublic:{
    type:Boolean,
    default:false
},
views:{
    type:Number,
    default:0
},

featureArtworkid:{
    type:Number,
}
  
},
{
  timestamps: true
});

export default mongoose.model("artWork", artWorkSchema);