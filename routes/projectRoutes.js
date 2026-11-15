const express = require('express');
const router = express.Router();

// njibou les fonctions اللي تتحكم في les projets
const {
    createProject,
    getMyProjects,
    getAllProjects,
    getProjectById,
    updateProject,
    deleteProject
} = require('../controllers/projectController');

// njib les middlewares 
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');

// نفرضو على user يعمل connexion قبل ما يستعمل أي route
router.use(authMiddleware);

// nasn3ou projet جديد
router.post('/', createProject);

// عرض  les projets كان لـ manager ينجم يعملها
router.get('/all', roleMiddleware('manager'), getAllProjects);

// عرض les projets متاع user لحالي
router.get('/', getMyProjects);

// نلوج على projet باستعمال الـ id متاعو
router.get('/:id', getProjectById);

// naadlou l projet موجود
router.put('/:id', updateProject);

// نفسخ projet حسب الـ id متاعو
router.delete('/:id', deleteProject);


module.exports = router;

