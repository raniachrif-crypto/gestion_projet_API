const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
    titre: {
        type: String,
        required: true
    },

    description: {
        type: String
    },

    statut: {
        type: String,
        enum: ['todo', 'doing', 'done'],
        default: 'todo'
    },

    dateLimite: {
        type: Date
    },

    projet: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project',
        required: true
    },

    assigneA: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    }

}, {
    timestamps: true
});

module.exports = mongoose.model('Task', taskSchema);
