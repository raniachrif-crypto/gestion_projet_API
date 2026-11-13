const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
    nom: {
        type: String,
        required: true
    },

    description: {
        type: String
    },

    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    statut: {
        type: String,
        enum: ['en cours', 'terminé', 'en pause'],
        default: 'en cours'
    }

}, {
    timestamps: true
});

module.exports = mongoose.model('Project', projectSchema);