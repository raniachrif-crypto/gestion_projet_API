const mongoose = require('mongoose');

// نعملو schema باش نحددو structure متاع user في MongoDB
const userSchema = new mongoose.Schema({

    // اسم user 
   nom: {
        type: String,
        required: true
    },

    // Login  لازم يكون موجود وما يتعاودش عند user آخر
    login: {
        type: String,
        required: true,
        unique: true
    },

    // Mot de passe، نخليوه crypté وقت نجيبو les utilisateurs من bd 
    password: {
        type: String,
        required: true,
        select: false
    },

    // Role متاع المستخدم: يا إما user يا إما manager
    // كان ما نحدّدوش Role، نعطيوه user automatiquement
    role: {
        type: String,
        enum: ['user', 'manager'],
        default: 'user'
    }

}, {
    //  تزيد وحدها تاريخ الإنشاء  
    timestamps: true
});

module.exports = mongoose.model('User', userSchema);
