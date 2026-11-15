# API REST de Gestion de Projets et de Tâches

## Description
Ce projet consiste à développer une API REST permettant la gestion des projets et des tâches avec Express.js et MongoDB.

## Technologies utilisées
- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT
- bcryptjs

## Fonctionnalités
- Inscription et authentification des utilisateurs.
- Authentification sécurisée avec JWT.
- Gestion des rôles : User et Manager.
- Création, modification, consultation et suppression des projets.
- Gestion des tâches associées aux projets.
- Affectation des tâches aux utilisateurs par le Manager.
- Recherche et tri des projets et des tâches.
- Protection des routes selon les rôles.

## Installation

1. Cloner le dépôt GitHub.
2. Installer les dépendances :

```bash
npm install
```

3. Créer un fichier `.env` avec les variables suivantes :

```env
PORT=3000
MONGO_URI=mongodb://127.0.0.1:27017/gestion_projets
JWT_SECRET=your_secret_key
```

4. Démarrer le serveur :

```bash
npm run dev
```

## Auteurs
- [Cherif Rania]