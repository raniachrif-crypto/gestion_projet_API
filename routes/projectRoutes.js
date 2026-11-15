const express = require('express');
const router = express.Router();

// نستوردو les fonctions اللي تتحكّم في المشاريع
const {
    createProject,
    getMyProjects,
    getAllProjects,
    getProjectById,
    updateProject,
    deleteProject
} = require('../controllers/projectController');

// نستوردو les middlewares متاع الحماية والصلاحيات
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');

// نفرضو على المستخدم يعمل connexion قبل ما يستعمل أي route
router.use(authMiddleware);

// إنشاء projet جديد
router.post('/', createProject);

// عرض جميع المشاريع، كان الـ Manager ينجم يعملها
router.get('/all', roleMiddleware('manager'), getAllProjects);

// عرض المشاريع متاع المستخدم الحالي
router.get('/', getMyProjects);

// البحث على projet باستعمال الـ ID متاعو
router.get('/:id', getProjectById);

// تعديل projet موجود
router.put('/:id', updateProject);

// حذف projet باستعمال الـ ID متاعو
router.delete('/:id', deleteProject);

// نصدّرو router باش نستعملوه في server.js
module.exports = router;

