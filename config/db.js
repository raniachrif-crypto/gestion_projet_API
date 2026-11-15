const mongoose = require('mongoose');

// Fonction باش نربطو app ب db MongoDB
const connectDB = async () => {
    try {
        // نعملو connexion   
        await mongoose.connect(process.env.MONGO_URI);

        // نطبعو msg في console كي تنجح connexion
        console.log('MongoDB connecté avec succès !');

    } catch (error) {
        // كان تصير مشكلة في cnx نشوفو سبب l erreur
        console.error('Erreur MongoDB :', error.message);

        // نوقفو app خاطر ما ينجمش يخدم من غير  db
        process.exit(1);
    }
};

//  fonction باش نستعملوها في server.js
module.exports = connectDB;
