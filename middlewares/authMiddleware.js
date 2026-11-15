
const jwt = require('jsonwebtoken');

// نثبتو اللي user عامل connexion وعندو Token صحيح
const authMiddleware = (req, res, next) => {
    try {
        // ناخذو token من header
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                message: 'Accès refusé : Token manquant'
            });
        }

        // نقصو bearer ونخليو token وحدو
        const token = authHeader.split(' ')[1];

        // نثبتو من  token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // نخزنو معلومات user  في req.user
        req.user = decoded;
        next();

    } catch (error) {
        return res.status(401).json({
            message: 'Token invalide ou expiré'
        });
    }
};

module.exports = authMiddleware;
