
const Project = require('../models/Project');

// Création d'un projet
exports.createProject = async (req, res) => {
    try {
        const { nom, description, statut } = req.body;

        // نتثبتو اللي اسم المشروع موجود
        if (!nom) {
            return res.status(400).json({
                message: 'Le nom du projet est obligatoire'
            });
        }

        // نصنعو projet جديد ونربطوه بالمستخدم المتصل
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
        res.status(500).json({ message: error.message });
    }
};


// Afficher les projets de l'utilisateur connecté
exports.getMyProjects = async (req, res) => {
    try {
        const projects = await Project.find({
            owner: req.user.id
        });

        res.status(200).json(projects);

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


// Afficher tous les projets (Manager uniquement)
exports.getAllProjects = async (req, res) => {
    try {
        const projects = await Project.find()
            .populate('owner', 'nom login');

        res.status(200).json(projects);

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


// Afficher un projet par son ID
exports.getProjectById = async (req, res) => {
    try {
        const project = await Project.findOne({
            _id: req.params.id,
            owner: req.user.id
        });

        if (!project) {
            return res.status(404).json({
                message: 'Projet introuvable'
            });
        }

        res.status(200).json(project);

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


// Modifier un projet
exports.updateProject = async (req, res) => {
    try {
        const { nom, description, statut } = req.body;

        const project = await Project.findOneAndUpdate(
            {
                _id: req.params.id,
                owner: req.user.id
            },
            { nom, description, statut },
            { new: true, runValidators: true }
        );

        if (!project) {
            return res.status(404).json({
                message: 'Projet introuvable'
            });
        }

        res.status(200).json({
            message: 'Projet modifié avec succès',
            project
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


// Supprimer un projet
exports.deleteProject = async (req, res) => {
    try {
        const project = await Project.findOneAndDelete({
            _id: req.params.id,
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
        res.status(500).json({ message: error.message });
    }
};
