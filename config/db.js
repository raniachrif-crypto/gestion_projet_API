const mongoose = require('mongoose');

// Fonction باش نربطو التطبيق بقاعدة البيانات MongoDB
const connectDB = async () => {
    try {
        // نعملو connexion باستعمال الرابط الموجود في fichier .env
        await mongoose.connect(process.env.MONGO_URI);

        // نطبعو message في console كي تنجح connexion
        console.log('MongoDB connecté avec succès !');

    } catch (error) {
        // كان تصير مشكلة في connexion، نطبعو سبب الخطأ
        console.error('Erreur MongoDB :', error.message);

        // نوقفو التطبيق خاطر ما ينجمش يخدم من غير قاعدة البيانات
        process.exit(1);
    }
};

// نصدّرو fonction باش نستعملوها في server.js
module.exports = connectDB;
