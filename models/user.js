const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    nom: {
        type: String,
        required: true
    },

    login: {
        type: String,
        required: true,
        unique: true
    },

    password: {
        type: String,
        required: true,
        select: false
    },

    role: {
        type: String,
        enum: ['user', 'manager'],
        default: 'user'
    }

}, {
    timestamps: true
});

module.exports = mongoose.model('User', userSchema);