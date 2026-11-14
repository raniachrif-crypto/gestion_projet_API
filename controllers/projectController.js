
const mongoose = require('mongoose');
const Project = require('../models/project');

// 1. Créer un projet
const createProject = async (req, res) => {
    try {
        const { nom, description, statut } = req.body;

        if (!nom || !nom.trim()) {
            return res.status(400).json({
                message: 'Le nom du projet est obligatoire'
            });
        }

        const project = await Project.create({
            nom,
            description,
            statut,
            owner: req.user.id
        });

        res.status(201).json({
            message: 'Projet créé avec succès',
            project
        });

    } catch (error) {
        res.status(500).json({
            message: 'Erreur lors de la création du projet',
            error: error.message
        });
    }
};


// 2. Afficher mes projets
const getMyProjects = async (req, res) => {
    try {
        const projects = await Project.find({
            owner: req.user.id
        });

        res.status(200).json({
            message: 'Mes projets',
            projects
        });

    } catch (error) {
        res.status(500).json({
            message: 'Erreur lors de la récupération des projets',
            error: error.message
        });
    }
};


// 3. Afficher tous les projets (Manager)
const getAllProjects = async (req, res) => {
    try {
        const projects = await Project.find()
            .populate('owner', 'nom login');

        res.status(200).json({
            message: 'Liste de tous les projets',
            projects
        });

    } catch (error) {
        res.status(500).json({
            message: 'Erreur lors de la récupération des projets',
            error: error.message
        });
    }
};


// 4. Afficher un projet par ID
const getProjectById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({
                message: 'ID du projet invalide'
            });
        }

        const project = await Project.findOne({
            _id: id,
            owner: req.user.id
        });

        if (!project) {
            return res.status(404).json({
                message: 'Projet introuvable'
            });
        }

        res.status(200).json({ project });

    } catch (error) {
        res.status(500).json({
            message: 'Erreur lors de la récupération du projet',
            error: error.message
        });
    }
};


// 5. Modifier un projet
const updateProject = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({
                message: 'ID du projet invalide'
            });
        }

        const { nom, description, statut } = req.body;

        const project = await Project.findOne({
            _id: id,
            owner: req.user.id
        });

        if (!project) {
            return res.status(404).json({
                message: 'Projet introuvable'
            });
        }

        if (nom !== undefined) {
    if (typeof nom !== 'string' || !nom.trim()) {
        return res.status(400).json({
            message: 'Le nom du projet ne peut pas être vide'
        });
    }

    project.nom = nom.trim();
}
        if (description !== undefined) project.description = description;
        if (statut !== undefined) project.statut = statut;

        await project.save();

        res.status(200).json({
            message: 'Projet modifié avec succès',
            project
        });

    } catch (error) {
        res.status(400).json({
            message: 'Erreur lors de la modification du projet',
            error: error.message
        });
    }
};


// 6. Supprimer un projet
const deleteProject = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({
                message: 'ID du projet invalide'
            });
        }

        const project = await Project.findOneAndDelete({
            _id: id,
            owner: req.user.id
        });

        if (!project) {
            return res.status(404).json({
                message: 'Projet introuvable'
            });
        }

        res.status(200).json({
            message: 'Projet supprimé avec succès'
        });

    } catch (error) {
        res.status(500).json({
            message: 'Erreur lors de la suppression du projet',
            error: error.message
        });
    }
};


// Exporter les fonctions
module.exports = {
    createProject,
    getMyProjects,
    getAllProjects,
    getProjectById,
    updateProject,
    deleteProject
};

