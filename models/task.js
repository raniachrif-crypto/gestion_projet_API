const mongoose = require('mongoose');

// نعملو Schema باش نحددو structure متاع tâche في MongoDB
const taskSchema = new mongoose.Schema({

    // عنوان المهمة، لازم يكون موجود
    titre: {
        type: String,
        required: true
    },

    // وصف المهمة، اختياري
    description: {
        type: String
    },

    // حالة المهمة: todo أو doing أو done
    // الحالة الافتراضية هي todo
    statut: {
        type: String,
        enum: ['todo', 'doing', 'done'],
        default: 'todo'
    },

    // التاريخ النهائي اللي لازم تكمل فيه المهمة
    dateLimite: {
        type: Date
    },

    // المشروع اللي تنتمي ليه المهمة
    // نستعملو ObjectId باش نربطو المهمة بالمشروع
    projet: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project',
        required: true
    },

    // المستخدم المعيّن للمهمة
    // ref: User تربط المهمة بالمستخدم
    // default: null معناها المهمة تنجم تتخلق من غير ما تتعيّن لشخص
    assigneA: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    }

}, {
    // MongoDB تزيد وحدها تاريخ الإنشاء وآخر تعديل
    timestamps: true
});

// نصدّرو Model Task باش نستعملوه في بقية الملفات
module.exports = mongoose.model('Task', taskSchema);
