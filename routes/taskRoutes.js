const express = require('express');
const router = express.Router();

// njib les fonctions المسؤولة على gestion des tâches
const {
    createTask,
    getTasks,
    getTaskById,
    updateTask,
    deleteTask,
    assignTask
} = require('../controllers/taskController');

// njib les middlewares 
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');

// نفرضو على user يكون عامل connexion وعندو token صحيح
router.use(authMiddleware);

// nasn3ou tâche جديدة
router.post('/', createTask);

// عرض les router.get('/', getTasks);

// nlawj على tâche ب الـ id متاعها
router.get('/:id', getTaskById);

// ىضضيثم tâche موجودة
router.put('/:id', updateTask);

// nfaskh tâche
router.delete('/:id', deleteTask);

// نعين tâche   كان للـ manager
router.patch('/:id/assign', roleMiddleware('manager'), assignTask);


module.exports = router;
