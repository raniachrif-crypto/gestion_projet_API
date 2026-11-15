const mongoose = require('mongoose');
const taskSchema = new mongoose.Schema({

    titre: {
        type: String,
        required: true
    },

    description: {
        type: String
    },

    // todo أو doing أو done
    // الحالة li par défaut هي todo
    statut: {
        type: String,
        enum: ['todo', 'doing', 'done'],
        default: 'todo'
    },

    // التاريخ اللي لازم تكمل فيه tache
    dateLimite: {
        type: Date
    },

    //  باش نربطو tache ب projet
    projet: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project',
        required: true
    },

    // ref: user تربط tache ب 
    // default: null  tache تنجم تتخلق من غير ما تتعين لشخص
    assigneA: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    }

}, {
    timestamps: true
});

module.exports = mongoose.model('Task', taskSchema);
