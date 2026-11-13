const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Inscription d'un utilisateur
exports.register = async (req, res) => {
    try {
        const { nom, login, password } = req.body;

        // نتثبتو اللي المعلومات الكل موجودة
        if (!nom || !login || !password) {
            return res.status(400).json({
                message: 'Tous les champs sont obligatoires'
            });
        }

        // نتثبتو اللي ال login موش موجود قبل
        const userExiste = await User.findOne({ login });

        if (userExiste) {
            return res.status(400).json({
                message: 'Ce login existe déjà'
            });
        }

        // نعملو تشفير لل mot de passe
        const hashedPassword = await bcrypt.hash(password, 10);

        // نصنعو utilisateur جديد
        const user = await User.create({
            nom,
            login,
            password: hashedPassword,
            role: 'user'
        });

        res.status(201).json({
            message: 'Utilisateur créé avec succès',
            user: {
                id: user._id,
                nom: user.nom,
                login: user.login,
                role: user.role
            }
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


// Connexion d'un utilisateur
exports.login = async (req, res) => {
    try {
        const { login, password } = req.body;

        // نتثبتو من المعلومات
        if (!login || !password) {
            return res.status(400).json({
                message: 'Login et mot de passe obligatoires'
            });
        }

        // نلقاو utilisateur حسب ال login
        const user = await User.findOne({ login }).select('+password');

        if (!user) {
            return res.status(401).json({
                message: 'Login ou mot de passe incorrect'
            });
        }

        // نقارنو mot de passe مع النسخة المشفرة
        const passwordCorrect = await bcrypt.compare(
            password,
            user.password
        );

        if (!passwordCorrect) {
            return res.status(401).json({
                message: 'Login ou mot de passe incorrect'
            });
        }

        // نصنعو JWT Token
        const token = jwt.sign(
            {
                id: user._id,
                role: user.role
            },
            process.env.JWT_SECRET,
            {
                expiresIn: '1d'
            }
        );

        res.status(200).json({
            message: 'Connexion réussie',
            token,
            user: {
                id: user._id,
                nom: user.nom,
                login: user.login,
                role: user.role
            }
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};