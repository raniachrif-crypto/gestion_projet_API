
const express = require('express');
const router = express.Router();

const {
    createProject,
    getMyProjects,
    getAllProjects,
    getProjectById,
    updateProject,
    deleteProject
} = require('../controllers/projectController');

const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');

// Toutes les routes nécessitent une authentification
router.use(authMiddleware);

// Créer un projet
router.post('/', createProject);

// Voir tous les projets (Manager uniquement)
router.get('/all', roleMiddleware('manager'), getAllProjects);

// Voir mes projets
router.get('/', getMyProjects);

// Voir un projet par ID
router.get('/:id', getProjectById);

// Modifier un projet
router.put('/:id', updateProject);

// Supprimer un projet
router.delete('/:id', deleteProject);

module.exports = router;
