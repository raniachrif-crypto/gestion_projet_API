const express = require('express');
const router = express.Router();

// نستوردو les fonctions متاع inscription et connexion
const {
    register,
    login
} = require('../controllers/authController');

// Route باش المستخدم يعمل inscription (إنشاء compte جديد)
router.post('/register', register);

// Route باش المستخدم يعمل connexion (تسجيل الدخول)
router.post('/login', login);

// نصدّرو router باش نستعملوه في server.js
module.exports = router;
