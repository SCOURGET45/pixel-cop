import mongoose from "mongoose";

const projectSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "InicioSesion",
        required: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    data: {
        type: String, // Base64 image data
        required: true
    },
    thumbnail: {
        type: String, // Base64 thumbnail data
        required: false
    },
    is_public: {
        type: Boolean,
        default: false
    },
    created_at: {
        type: Date,
        default: Date.now
    },
    updated_at: {
        type: Date,
        default: Date.now
    }
});

export default mongoose.model("Project", projectSchema);
