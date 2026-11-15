const mongoose = require('mongoose');

// نعملو Schema باش نحددو structure متاع utilisateur في MongoDB
const userSchema = new mongoose.Schema({

    // اسم المستخدم، لازم يكون موجود
    nom: {
        type: String,
        required: true
    },

    // Login متاع المستخدم، لازم يكون موجود وما يتعاودش عند مستخدم آخر
    login: {
        type: String,
        required: true,
        unique: true
    },

    // Mot de passe، نخليوه مخفي وقت نجيبو les utilisateurs من قاعدة البيانات
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
    // MongoDB تزيد وحدها تاريخ الإنشاء وآخر تعديل
    timestamps: true
});

// نصدّرو Model User باش نستعملوه في بقية الملفات
module.exports = mongoose.model('User', userSchema);
