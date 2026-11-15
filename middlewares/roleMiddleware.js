// نثبتو من Role متاع المستخدم
const roleMiddleware = (...roles) => {
    return (req, res, next) => {
        // كان الـ Role متاع المستخدم موش من الأدوار المسموح بيهم
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                message: 'Accès interdit : droits insuffisants'
            });
        }
        // كان الـ Role صحيح، نسمحو للمستخدم يكمل
        next();
    };
};

module.exports = roleMiddleware;

