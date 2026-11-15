
const mongoose = require('mongoose');
const Project = require('../models/project');

// 1. إنشاء مشروع جديد
const createProject = async (req, res) => {
    try {
        // ناخذو المعلومات اللي بعثها المستخدم
        const { nom, description, statut } = req.body;

        // نثبتو اللي اسم المشروع موجود وموش فارغ
        if (typeof nom !== 'string' || !nom.trim()) {
            return res.status(400).json({
                message: 'Le nom du projet est obligatoire'
            });
        }

        // نحددو الحالات المسموح بيها للمشروع
        const statutsAutorises = ['en cours', 'terminé', 'en pause'];

        // نثبتو اللي الحالة صحيحة
        if (statut && !statutsAutorises.includes(statut)) {
            return res.status(400).json({
                message: 'Statut du projet invalide'
            });
        }

        // نصنعو مشروع جديد ونربطوه بالمستخدم الحالي
        const project = await Project.create({
            nom: nom.trim(),
            description,
            statut,
            owner: req.user.id
        });

        // نرجعو المشروع بعد ما يتصنع بنجاح
        res.status(201).json({
            message: 'Projet créé avec succès',
            project
        });

    } catch (error) {
        // كان تصير مشكلة أثناء إنشاء المشروع
        res.status(500).json({
            message: 'Erreur lors de la création du projet',
            error: error.message
        });
    }
};


// 2. عرض المشاريع متاع المستخدم الحالي مع البحث والترتيب
const getMyProjects = async (req, res) => {
    try {
        // ناخذو كلمات البحث والفلترة والترتيب من URL
        const { search, statut, sortBy = 'createdAt', order = 'desc' } = req.query;

        // نجيبو كان المشاريع اللي يملكهم المستخدم الحالي
        const filter = { owner: req.user.id };

        // نحددو الحالات المسموح بيها
        const statutsAutorises = ['en cours', 'terminé', 'en pause'];

        // نثبتو من الحالة كان المستخدم بعثها
        if (statut && !statutsAutorises.includes(statut)) {
            return res.status(400).json({
                message: 'Statut du projet invalide'
            });
        }

        // نزيدو الحالة للفلتر كان موجودة
        if (statut) {
            filter.statut = statut;
        }

        // نبحثو على المشروع حسب الاسم
        if (search && search.trim()) {
            filter.nom = {
                $regex: search.trim(),
                $options: 'i'
            };
        }

        // نحددو الحقول اللي نسمحو بالترتيب حسبها
        const champsTri = ['nom', 'createdAt', 'statut'];

        // نثبتو اللي الحقل المطلوب موجود في القائمة
        if (!champsTri.includes(sortBy)) {
            return res.status(400).json({
                message: 'Champ de tri invalide'
            });
        }

        // نثبتو اللي اتجاه الترتيب صحيح
        if (!['asc', 'desc'].includes(order)) {
            return res.status(400).json({
                message: 'Ordre de tri invalide'
            });
        }

        // نجيبو المشاريع ونرتبوهم حسب الاختيار
        const projects = await Project.find(filter)
            .sort({ [sortBy]: order === 'asc' ? 1 : -1 });

        // نرجعو قائمة المشاريع وعددهم
        res.status(200).json({
            message: 'Mes projets',
            count: projects.length,
            projects
        });

    } catch (error) {
        // كان تصير مشكلة وقت جلب المشاريع
        res.status(500).json({
            message: 'Erreur lors de la récupération des projets',
            error: error.message
        });
    }
};


// 3. عرض المشاريع الكل (خاص بالـ Manager) مع البحث والترتيب
const getAllProjects = async (req, res) => {
    try {
        // ناخذو خيارات البحث والفلترة والترتيب
        const { search, statut, sortBy = 'createdAt', order = 'desc' } = req.query;

        // هنا ما نحطوش owner خاطر الـ Manager يشوف المشاريع الكل
        const filter = {};

        // نحددو الحالات المسموح بيها
        const statutsAutorises = ['en cours', 'terminé', 'en pause'];

        // نثبتو من الحالة كان موجودة
        if (statut && !statutsAutorises.includes(statut)) {
            return res.status(400).json({
                message: 'Statut du projet invalide'
            });
        }

        // نزيدو الحالة للفلتر
        if (statut) {
            filter.statut = statut;
        }

        // نبحثو على المشروع حسب الاسم
        if (search && search.trim()) {
            filter.nom = {
                $regex: search.trim(),
                $options: 'i'
            };
        }

        // نحددو الحقول المسموح بيها للترتيب
        const champsTri = ['nom', 'createdAt', 'statut'];

        // نثبتو من الحقل المطلوب
        if (!champsTri.includes(sortBy)) {
            return res.status(400).json({
                message: 'Champ de tri invalide'
            });
        }

        // نثبتو من اتجاه الترتيب
        if (!['asc', 'desc'].includes(order)) {
            return res.status(400).json({
                message: 'Ordre de tri invalide'
            });
        }

        // نجيبو المشاريع الكل ونجيبو معاهم معلومات أصحابهم
        const projects = await Project.find(filter)
            .populate('owner', 'nom login')
            .sort({ [sortBy]: order === 'asc' ? 1 : -1 });

        // نرجعو قائمة المشاريع الكل
        res.status(200).json({
            message: 'Liste de tous les projets',
            count: projects.length,
            projects
        });

    } catch (error) {
        // كان تصير مشكلة وقت جلب المشاريع
        res.status(500).json({
            message: 'Erreur lors de la récupération des projets',
            error: error.message
        });
    }
};


// 4. عرض مشروع معيّن باستعمال الـ ID
const getProjectById = async (req, res) => {
    try {
        // ناخذو ID المشروع من الرابط
        const { id } = req.params;

        // نثبتو اللي الـ ID عندو صيغة صحيحة
        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({
                message: 'ID du projet invalide'
            });
        }

        // نلقاو المشروع حسب الـ ID وصاحب المشروع
        const project = await Project.findOne({
            _id: id,
            owner: req.user.id
        });

        // كان المشروع موش موجود أو موش تابع للمستخدم
        if (!project) {
            return res.status(404).json({
                message: 'Projet introuvable'
            });
        }

        // نرجعو معلومات المشروع
        res.status(200).json({ project });

    } catch (error) {
        // كان تصير مشكلة وقت جلب المشروع
        res.status(500).json({
            message: 'Erreur lors de la récupération du projet',
            error: error.message
        });
    }
};


// 5. تعديل مشروع
const updateProject = async (req, res) => {
    try {
        // ناخذو ID المشروع من الرابط
        const { id } = req.params;

        // نثبتو من صحة الـ ID
        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({
                message: 'ID du projet invalide'
            });
        }

        // ناخذو المعلومات الجديدة
        const { nom, description, statut } = req.body;

        // نلقاو المشروع اللي يملكه المستخدم الحالي
        const project = await Project.findOne({
            _id: id,
            owner: req.user.id
        });

        // كان المشروع موش موجود أو موش تابع للمستخدم
        if (!project) {
            return res.status(404).json({
                message: 'Projet introuvable'
            });
        }

        // نثبتو من الاسم كان المستخدم حب يبدلو
        if (nom !== undefined) {
            if (typeof nom !== 'string' || !nom.trim()) {
                return res.status(400).json({
                    message: 'Le nom du projet ne peut pas être vide'
                });
            }

            // نعوضو الاسم القديم بالاسم الجديد
            project.nom = nom.trim();
        }

        // نبدلو الوصف كان المستخدم بعث وصف جديد
        if (description !== undefined) {
            project.description = description;
        }

        // نثبتو من الحالة الجديدة قبل ما نبدلوها
        if (statut !== undefined) {
            const statutsAutorises = ['en cours', 'terminé', 'en pause'];

            if (!statutsAutorises.includes(statut)) {
                return res.status(400).json({
                    message: 'Statut du projet invalide'
                });
            }

            // نعوضو الحالة القديمة بالحالة الجديدة
            project.statut = statut;
        }

        // نسجلو التغييرات في قاعدة البيانات
        await project.save();

        // نرجعو المشروع بعد التعديل
        res.status(200).json({
            message: 'Projet modifié avec succès',
            project
        });

    } catch (error) {
        // كان تصير مشكلة وقت التعديل
        res.status(400).json({
            message: 'Erreur lors de la modification du projet',
            error: error.message
        });
    }
};


// 6. حذف مشروع
const deleteProject = async (req, res) => {
    try {
        // ناخذو ID المشروع من الرابط
        const { id } = req.params;

        // نثبتو من صحة الـ ID
        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({
                message: 'ID du projet invalide'
            });
        }

        // نحذفو المشروع كان تابع للمستخدم الحالي
        const project = await Project.findOneAndDelete({
            _id: id,
            owner: req.user.id
        });

        // كان المشروع موش موجود أو موش تابع للمستخدم
        if (!project) {
            return res.status(404).json({
                message: 'Projet introuvable'
            });
        }

        // نعلمو المستخدم اللي الحذف تم بنجاح
        res.status(200).json({
            message: 'Projet supprimé avec succès'
        });

    } catch (error) {
        // كان تصير مشكلة وقت الحذف
        res.status(500).json({
            message: 'Erreur lors de la suppression du projet',
            error: error.message
        });
    }
};


// نخرجو الدوال باش نستعملوهم في routes
module.exports = {
    createProject,
    getMyProjects,
    getAllProjects,
    getProjectById,
    updateProject,
    deleteProject
};
