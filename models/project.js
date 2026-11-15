const mongoose = require('mongoose');

// نعملو Schema باش نحددو structure متاع projet في MongoDB
const projectSchema = new mongoose.Schema({

    // اسم المشروع، لازم يكون موجود
    nom: {
        type: String,
        required: true
    },

    // وصف المشروع، اختياري
    description: {
        type: String
    },

    // صاحب المشروع (Owner)
    // نستعملو ObjectId باش نربطو المشروع بالمستخدم الموجود في Collection User
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    // حالة المشروع، نقبلو كان الحالات الثلاثة هاذم
    // الحالة الافتراضية هي en cours
    statut: {
        type: String,
        enum: ['en cours', 'terminé', 'en pause'],
        default: 'en cours'
    }

}, {
    // MongoDB تزيد وحدها تاريخ الإنشاء وآخر تعديل
    timestamps: true
});

// نصدّرو Model Project باش نستعملوه في بقية الملفات
module.exports = mongoose.model('Project', projectSchema);
