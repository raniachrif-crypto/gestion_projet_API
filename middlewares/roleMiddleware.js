// نثبتو من role متاع l user قبل ما نسمحوولو يوصل لبعض les routes
const roleMiddleware = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                message: 'Accès interdit : droits insuffisants'
            });
        }
        next();
    };
};

module.exports = roleMiddleware;

