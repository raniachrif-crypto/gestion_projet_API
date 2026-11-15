# API REST de Gestion de Projets et de Tâches

## Description
Ce projet consiste à développer une API REST permettant de gérer des projets et les tâches associées. L'API est développée avec Node.js, Express.js et MongoDB.

Elle permet aux utilisateurs de créer et gérer leurs projets et tâches, avec un système d'authentification et de gestion des rôles.

## Technologies utilisées
- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT (JSON Web Token)
- bcryptjs

## Fonctionnalités
- Inscription et connexion des utilisateurs.
- Authentification sécurisée avec JWT.
- Gestion des rôles : User et Manager.
- Création, consultation, modification et suppression des projets.
- Consultation de ses propres projets.
- Consultation de tous les projets par le Manager.
- Création et gestion des tâches associées aux projets.
- Affectation des tâches aux utilisateurs par le Manager.
- Gestion des statuts des tâches : `todo`, `doing`, `done`.
- Recherche, filtrage et tri des projets et des tâches.
- Protection des routes avec des middlewares d'authentification et d'autorisation.

## Installation

### 1. Cloner le dépôt
```bash
git clone https://github.com/raniachrif-crypto/gestion_projet_API.git
```

### 2. Accéder au dossier
```bash
cd gestion_projet_API
```

### 3. Installer les dépendances
```bash
npm install
```

### 4. Configurer les variables d'environnement

Créer un fichier `.env` à la racine du projet :

```env
PORT=3000
MONGO_URI=mongodb://127.0.0.1:27017/gestion_projets
JWT_SECRET=your_secret_key
```

Remplacer `your_secret_key` par une clé secrète personnelle.

### 5. Démarrer le serveur
```bash
npm run dev
```

Le serveur démarre sur le port 3000 et se connecte à MongoDB.

## Routes principales de l'API

### Authentification
| Méthode | Route | Description |
|---|---|---|
| POST | `/api/auth/register` | Inscription |
| POST | `/api/auth/login` | Connexion |

### Projets
| Méthode | Route | Description |
|---|---|---|
| POST | `/api/projects` | Créer un projet |
| GET | `/api/projects` | Consulter ses projets |
| GET | `/api/projects/all` | Consulter tous les projets (Manager) |
| GET | `/api/projects/:id` | Consulter un projet |
| PUT | `/api/projects/:id` | Modifier un projet |
| DELETE | `/api/projects/:id` | Supprimer un projet |

### Tâches
| Méthode | Route | Description |
|---|---|---|
| POST | `/api/tasks` | Créer une tâche |
| GET | `/api/tasks` | Consulter les tâches |
| GET | `/api/tasks/:id` | Consulter une tâche |
| PUT | `/api/tasks/:id` | Modifier une tâche |
| DELETE | `/api/tasks/:id` | Supprimer une tâche |
| PATCH | `/api/tasks/:id/assign` | Affecter une tâche (Manager) |

Les routes protégées nécessitent un token JWT dans l'en-tête Authorization sous la forme `Bearer TOKEN`.

## Auteurs
- Cherif Rania

