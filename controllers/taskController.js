
const Task = require('../models/task');
const Project = require('../models/project');
const User = require('../models/user');
const mongoose = require('mongoose');

// إنشاء مهمة جديدة
exports.createTask = async (req, res) => {
    try {
        const { titre, description, statut, dateLimite, projet } = req.body;

        // نتثبتو اللي العنوان و ID المشروع موجودين
        if (typeof titre !== 'string' || !titre.trim() || !projet) {
            return res.status(400).json({
                message: 'Le titre et le projet sont obligatoires'
            });
        }

        // نتثبتو من صحة ID المشروع
        if (!mongoose.isValidObjectId(projet)) {
            return res.status(400).json({
                message: 'ID du projet invalide'
            });
        }

        // نتثبتو من statut
        if (statut !== undefined &&
            !['todo', 'doing', 'done'].includes(statut)) {
            return res.status(400).json({
                message: 'Statut invalide'
            });
        }

        // نتثبتو من dateLimite
        if (dateLimite !== undefined &&
            isNaN(Date.parse(dateLimite))) {
            return res.status(400).json({
                message: 'Date limite invalide'
            });
        }

        // نتثبتو اللي المشروع موجود
        const project = await Project.findById(projet);

        if (!project) {
            return res.status(404).json({
                message: 'Projet introuvable'
            });
        }

        // نتثبتو اللي المستخدم هو صاحب المشروع
        if (project.owner.toString() !== req.user.id) {
            return res.status(403).json({
                message: 'Vous ne pouvez pas ajouter une tâche à ce projet'
            });
        }

        // إنشاء المهمة
        const task = await Task.create({
            titre: titre.trim(),
            description,
            statut,
            dateLimite,
            projet
        });

        res.status(201).json({
            message: 'Tâche créée avec succès',
            task
        });

    } catch (error) {
        res.status(500).json({
            message: 'Erreur lors de la création de la tâche',
            error: error.message
        });
    }
};


// عرض المهام مع البحث والترتيب
exports.getTasks = async (req, res) => {
    try {
        const { search, statut, sortBy, order } = req.query;

        // نعملو filter حسب Role متاع المستخدم
        let filter = {};

        if (req.user.role !== 'manager') {

            // نجيبو المشاريع متاع المستخدم الحالي
            const projects = await Project.find({
                owner: req.user.id
            }).select('_id');

            const projectIds = projects.map(project => project._id);

            // المستخدم يشوف كان المهام متاع مشاريعه
            filter.projet = { $in: projectIds };
        }

        // البحث حسب عنوان المهمة
        if (search) {
            filter.titre = {
                $regex: search,
                $options: 'i'
            };
        }

        // التثبت من statut
        if (statut) {
            if (!['todo', 'doing', 'done'].includes(statut)) {
                return res.status(400).json({
                    message: 'Statut invalide'
                });
            }

            filter.statut = statut;
        }

        // تحديد حقل الترتيب
        const allowedSortFields = [
            'createdAt',
            'dateLimite',
            'titre'
        ];

        const field = allowedSortFields.includes(sortBy)
            ? sortBy
            : 'createdAt';

        const direction = order === 'asc' ? 1 : -1;

        // جلب المهام من قاعدة البيانات
        const tasks = await Task.find(filter)
            .populate('projet', 'nom')
            .populate('assigneA', 'nom login')
            .sort({ [field]: direction });

        res.status(200).json({
            nombre: tasks.length,
            tasks
        });

    } catch (error) {
        res.status(500).json({
            message: 'Erreur lors de la récupération des tâches',
            error: error.message
        });
    }
};


// عرض مهمة حسب ID
exports.getTaskById = async (req, res) => {
    try {
        const { id } = req.params;

        // التثبت من صحة ID
        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({
                message: 'ID de la tâche invalide'
            });
        }

        const task = await Task.findById(id);

        if (!task) {
            return res.status(404).json({
                message: 'Tâche introuvable'
            });
        }

        // نتثبتو اللي المشروع تابع للمستخدم
        const project = await Project.findOne({
            _id: task.projet,
            owner: req.user.id
        });

        if (!project) {
            return res.status(403).json({
                message: 'Accès interdit à cette tâche'
            });
        }

        await task.populate('projet', 'nom');
        await task.populate('assigneA', 'nom login');

        res.status(200).json(task);

    } catch (error) {
        res.status(500).json({
            message: 'Erreur lors de la récupération de la tâche',
            error: error.message
        });
    }
};


// Modifier une tâche
exports.updateTask = async (req, res) => {
    try {
        const { id } = req.params;
        const { titre, description, statut, dateLimite } = req.body;

        // التثبت من صحة ID
        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({
                message: 'ID de la tâche invalide'
            });
        }

        const task = await Task.findById(id);

        if (!task) {
            return res.status(404).json({
                message: 'Tâche introuvable'
            });
        }

        // نتثبتو اللي المستخدم هو صاحب المشروع
        const project = await Project.findOne({
            _id: task.projet,
            owner: req.user.id
        });

        if (!project) {
            return res.status(403).json({
                message: 'Accès interdit à cette tâche'
            });
        }

        // التثبت من العنوان
        if (titre !== undefined) {
            if (typeof titre !== 'string' || !titre.trim()) {
                return res.status(400).json({
                    message: 'Le titre ne peut pas être vide'
                });
            }

            task.titre = titre.trim();
        }

        if (description !== undefined) {
            task.description = description;
        }

        // التثبت من statut
        if (statut !== undefined) {
            if (!['todo', 'doing', 'done'].includes(statut)) {
                return res.status(400).json({
                    message: 'Statut invalide'
                });
            }

            task.statut = statut;
        }

        // التثبت من dateLimite
        if (dateLimite !== undefined) {
            const date = new Date(dateLimite);

            if (isNaN(date.getTime())) {
                return res.status(400).json({
                    message: 'Date limite invalide'
                });
            }

            task.dateLimite = date;
        }

        await task.save();

        res.status(200).json({
            message: 'Tâche modifiée avec succès',
            task
        });

    } catch (error) {
        res.status(500).json({
            message: 'Erreur lors de la modification de la tâche',
            error: error.message
        });
    }
};


// Supprimer une tâche
exports.deleteTask = async (req, res) => {
    try {
        const { id } = req.params;

        // التثبت من صحة ID
        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({
                message: 'ID de la tâche invalide'
            });
        }

        const task = await Task.findById(id);

        if (!task) {
            return res.status(404).json({
                message: 'Tâche introuvable'
            });
        }

        // نتثبتو اللي المستخدم هو صاحب المشروع
        const project = await Project.findOne({
            _id: task.projet,
            owner: req.user.id
        });

        if (!project) {
            return res.status(403).json({
                message: 'Accès interdit à cette tâche'
            });
        }

        await Task.findByIdAndDelete(id);

        res.status(200).json({
            message: 'Tâche supprimée avec succès'
        });

    } catch (error) {
        res.status(500).json({
            message: 'Erreur lors de la suppression de la tâche',
            error: error.message
        });
    }
};


// Assigner une tâche à un utilisateur
exports.assignTask = async (req, res) => {
    try {
        const { id } = req.params;
        const { assigneA } = req.body;

        // نتثبتو من Role متاع المستخدم
        if (req.user.role !== 'manager') {
            return res.status(403).json({
                message: 'Seul le manager peut assigner une tâche'
            });
        }

        // التثبت من IDs
        if (!mongoose.isValidObjectId(id) ||
            !mongoose.isValidObjectId(assigneA)) {
            return res.status(400).json({
                message: 'ID invalide'
            });
        }

        // نتثبتو اللي المهمة موجودة
        const task = await Task.findById(id);

        if (!task) {
            return res.status(404).json({
                message: 'Tâche introuvable'
            });
        }

        // نتثبتو اللي المستخدم موجود
        const user = await User.findById(assigneA);

        if (!user) {
            return res.status(404).json({
                message: 'Utilisateur introuvable'
            });
        }

        // إسناد المهمة للمستخدم
        task.assigneA = assigneA;
        await task.save();

        res.status(200).json({
            message: 'Tâche assignée avec succès',
            task
        });

    } catch (error) {
        res.status(500).json({
            message: "Erreur lors de l'assignation de la tâche",
            error: error.message
        });
    }
};


