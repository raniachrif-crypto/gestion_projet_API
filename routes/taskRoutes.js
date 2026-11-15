const express = require('express');
const router = express.Router();

// نستوردو les fonctions المسؤولة على gestion des tâches
const {
    createTask,
    getTasks,
    getTaskById,
    updateTask,
    deleteTask,
    assignTask
} = require('../controllers/taskController');

// نستوردو les middlewares متاع الحماية والتثبت من الصلاحيات
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');

// نفرضو على المستخدم يكون عامل connexion وعندو Token صحيح
router.use(authMiddleware);

// إنشاء tâche جديدة
router.post('/', createTask);

// عرض قائمة المهام
router.get('/', getTasks);

// البحث على tâche باستعمال الـ ID متاعها
router.get('/:id', getTaskById);

// تعديل tâche موجودة
router.put('/:id', updateTask);

// حذف tâche
router.delete('/:id', deleteTask);

// تعيين tâche لمستخدم، والعملية هاذي مسموحة كان للـ Manager
router.patch('/:id/assign', roleMiddleware('manager'), assignTask);

// نصدّرو router باش نستعملوه في server.js
module.exports = router;
