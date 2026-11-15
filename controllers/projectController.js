
const mongoose = require('mongoose');
const Project = require('../models/project');

// 1. Créer un projet
const createProject = async (req, res) => {
    try {
        const { nom, description, statut } = req.body;

        // نثبتو اللي اسم المشروع موجود
        if (typeof nom !== 'string' || !nom.trim()) {
            return res.status(400).json({
                message: 'Le nom du projet est obligatoire'
            });
        }

        // نثبتو اللي statut صحيح
        const statutsAutorises = ['en cours', 'terminé', 'en pause'];

        if (statut && !statutsAutorises.includes(statut)) {
            return res.status(400).json({
                message: 'Statut du projet invalide'
            });
        }

        const project = await Project.create({
            nom: nom.trim(),
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


// 2. Afficher mes projets avec recherche et tri
const getMyProjects = async (req, res) => {
    try {
        const { search, statut, sortBy = 'createdAt', order = 'desc' } = req.query;

        // نجيبو كان المشاريع متاع المستخدم الحالي
        const filter = { owner: req.user.id };

        // نثبتو من statut كان موجود
        const statutsAutorises = ['en cours', 'terminé', 'en pause'];

        if (statut && !statutsAutorises.includes(statut)) {
            return res.status(400).json({
                message: 'Statut du projet invalide'
            });
        }

        if (statut) {
            filter.statut = statut;
        }

        // نبحثو على المشروع بالاسم
        if (search && search.trim()) {
            filter.nom = {
                $regex: search.trim(),
                $options: 'i'
            };
        }

        // نحددو الحقول المسموح بيها للترتيب
        const champsTri = ['nom', 'createdAt', 'statut'];

        if (!champsTri.includes(sortBy)) {
            return res.status(400).json({
                message: 'Champ de tri invalide'
            });
        }

        if (!['asc', 'desc'].includes(order)) {
            return res.status(400).json({
                message: 'Ordre de tri invalide'
            });
        }

        const projects = await Project.find(filter)
            .sort({ [sortBy]: order === 'asc' ? 1 : -1 });

        res.status(200).json({
            message: 'Mes projets',
            count: projects.length,
            projects
        });

    } catch (error) {
        res.status(500).json({
            message: 'Erreur lors de la récupération des projets',
            error: error.message
        });
    }
};


// 3. Afficher tous les projets avec recherche et tri (Manager)
const getAllProjects = async (req, res) => {
    try {
        const { search, statut, sortBy = 'createdAt', order = 'desc' } = req.query;

        // نجيبو المشاريع الكل
        const filter = {};

        const statutsAutorises = ['en cours', 'terminé', 'en pause'];

        if (statut && !statutsAutorises.includes(statut)) {
            return res.status(400).json({
                message: 'Statut du projet invalide'
            });
        }

        if (statut) {
            filter.statut = statut;
        }

        // نبحثو على المشروع بالاسم
        if (search && search.trim()) {
            filter.nom = {
                $regex: search.trim(),
                $options: 'i'
            };
        }

        const champsTri = ['nom', 'createdAt', 'statut'];

        if (!champsTri.includes(sortBy)) {
            return res.status(400).json({
                message: 'Champ de tri invalide'
            });
        }

        if (!['asc', 'desc'].includes(order)) {
            return res.status(400).json({
                message: 'Ordre de tri invalide'
            });
        }

        const projects = await Project.find(filter)
            .populate('owner', 'nom login')
            .sort({ [sortBy]: order === 'asc' ? 1 : -1 });

        res.status(200).json({
            message: 'Liste de tous les projets',
            count: projects.length,
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

