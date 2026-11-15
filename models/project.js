const mongoose = require('mongoose');

// نعملو schema باش نحددو structure متاع projet في MongoDB
const projectSchema = new mongoose.Schema({

    // اسم l projet
    nom: {
        type: String,
        required: true
    },

    // وصف l projet 
    description: {
        type: String
    },

    // نستعملو ObjectId باش نربطو l p rojet بuser الموجود في collection User
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    //  fl projet الحالات الثلاثة هاذم
    statut: {
        type: String,
        enum: ['en cours', 'terminé', 'en pause'],
        default: 'en cours'
    }

}, {
    //  تزيد وحدها تاريخ الإنشاء وآخر تعديل
    timestamps: true
});

module.exports = mongoose.model('Project', projectSchema);
