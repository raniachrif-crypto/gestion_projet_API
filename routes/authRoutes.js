const express = require('express');
const router = express.Router();

// njibou les fonctions متاع inscription et connexion
const {
    register,
    login
} = require('../controllers/authController');

// Route باش user يعمل inscription (naamlou compte جديد)
router.post('/register', register);

// Route باش user يعمل connexion 
router.post('/login', login);


module.exports = router;
