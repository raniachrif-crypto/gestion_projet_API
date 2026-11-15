# API REST de Gestion de Projets et de Tâches

## Description
Ce projet consiste à réaliser une API REST pour gérer des projets et leurs tâches avec Node.js, Express.js et MongoDB.

## Technologies utilisées
- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT
- bcryptjs

## Fonctionnalités
- Inscription et connexion des utilisateurs.
- Authentification avec JWT.
- Gestion des rôles : User et Manager.
- Création, modification, consultation et suppression des projets.
- Création et gestion des tâches.
- Affectation des tâches par le Manager.
- Recherche, filtrage et tri des projets et des tâches.
- Protection des routes selon les rôles.

## Installation

1. Cloner le projet :
```bash
git clone https://github.com/raniachrif-crypto/gestion_projet_API.git
```

2. Accéder au dossier :
```bash
cd gestion_projet_API
```

3. Installer les dépendances :
```bash
npm install
```

4. Créer un fichier `.env` à la racine du projet :
```env
PORT=3000
MONGO_URI=mongodb://127.0.0.1:27017/gestion_projets
JWT_SECRET=your_secret_key
```

5. Démarrer le serveur :
```bash
npm run dev
```

## Routes principales

| Méthode | Route | Description |
|---|---|---|
| POST | `/api/auth/register` | Inscription |
| POST | `/api/auth/login` | Connexion |
| POST | `/api/projects` | Créer un projet |
| GET | `/api/projects` | Voir ses projets |
| GET | `/api/projects/all` | Voir tous les projets (Manager) |
| GET | `/api/tasks` | Voir les tâches |
| POST | `/api/tasks` | Créer une tâche |
| PATCH | `/api/tasks/:id/assign` | Affecter une tâche (Manager) |

## Auteur
Cherif Rania
