
const jwt = require('jsonwebtoken');

// نثبتو اللي المستخدم عامل connexion وعندو Token صحيح
const authMiddleware = (req, res, next) => {
    try {
        // ناخذو Token من Header
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                message: 'Accès refusé : Token manquant'
            });
        }

        // نقصّو Bearer ونخليو Token وحدو
        const token = authHeader.split(' ')[1];

        // نثبتو من صحة Token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // نخزنو معلومات المستخدم في req.user
        req.user = decoded;

        // نكملو للمرحلة الموالية
        next();

    } catch (error) {
        return res.status(401).json({
            message: 'Token invalide ou expiré'
        });
    }
};

module.exports = authMiddleware;
