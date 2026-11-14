
const express = require('express');
const router = express.Router();

// نستوردو les fonctions متاع gestion des tâches
const {
    createTask,
    getTasks,
    getTaskById,
    updateTask,
    deleteTask,
    assignTask
} = require('../controllers/taskController');

// نستوردو les middlewares
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');

// جميع les routes محمية بالـ Token
router.use(authMiddleware);

// Créer une tâche
router.post('/', createTask);

// Afficher les tâches
router.get('/', getTasks);

// Afficher une tâche par ID
router.get('/:id', getTaskById);

// Modifier une tâche
router.put('/:id', updateTask);

// Supprimer une tâche
router.delete('/:id', deleteTask);

// Affecter une tâche (manager uniquement)
router.patch('/:id/assign', roleMiddleware('manager'), assignTask);

module.exports = router;
