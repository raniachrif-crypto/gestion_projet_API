
const mongoose = require('mongoose');
const Project = require('../models/project');

// 1. نصنعو projet جديد
const createProject = async (req, res) => {
    try {
        // ناخذو المعلومات اللي بعثها utilisateur
        const { nom, description, statut } = req.body;

        // نثبتو اللي اسم projet موجود وموش فارغ
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

        // نصنعو مشروع جديد ونربطوه ب utilisateur 
        const project = await Project.create({
            nom: nom.trim(),
            description,
            statut,
            owner: req.user.id
        });

        // نرجعو المشروع بعد ما يتصنع 
        res.status(201).json({
            message: 'Projet créé avec succès',
            project
        });

    } catch (error) {
        // كان تصير مشكلة وقت نعملو projet
        res.status(500).json({
            message: 'Erreur lors de la création du projet',
            error: error.message
        });
    }
};


// 2. عرض les projets متاع utilisateur الحالي مع البحث والترتيب
const getMyProjects = async (req, res) => {
    try {
        // ناخذو كلمات البحث والفلترة والترتيب من URL
        const { search, statut, sortBy = 'createdAt', order = 'desc' } = req.query;

        // نجيبو كان les projets اللي يملكهم المستخدم الحالي
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

        // نلوجو على المشروع حسب الاسم
        if (search && search.trim()) {
            filter.nom = {
                $regex: search.trim(),
                $options: 'i'
            };
        }

        // نحددو les champs اللي يصيرالترتيب حسبها
        const champsTri = ['nom', 'createdAt', 'statut'];

        // نثبتو اللي champs المطلوب موجود في القائمة
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

        // نجيبو les projets ونرتبوهم حسب الاختيار
        const projects = await Project.find(filter)
            .sort({ [sortBy]: order === 'asc' ? 1 : -1 });

        // نرجعو قائمة les projets وعددهم
        res.status(200).json({
            message: 'Mes projets',
            count: projects.length,
            projects
        });

    } catch (error) {
        // كان تصير مشكلة وقت نجيبو les projets
        res.status(500).json({
            message: 'Erreur lors de la récupération des projets',
            error: error.message
        });
    }
};


// 3. عرض les projets الكل (manager) مع البحث والترتيب
const getAllProjects = async (req, res) => {
    try {
        // ناخذو خيارات البحث والفلترة والترتيب
        const { search, statut, sortBy = 'createdAt', order = 'desc' } = req.query;

        // هنا ما نحطوش owner خاطر الـ Manager يشوف les projets الكل
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

        // نبحثو على projet حسب الاسم
        if (search && search.trim()) {
            filter.nom = {
                $regex: search.trim(),
                $options: 'i'
            };
        }

        // نحددو les champs المسموح بيها للترتيب
        const champsTri = ['nom', 'createdAt', 'statut'];

        // نثبتو من champs المطلوب
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

        // نجيبو les projets الكل ونجيبو معاهم معلومات أصحابهم
        const projects = await Project.find(filter)
            .populate('owner', 'nom login')
            .sort({ [sortBy]: order === 'asc' ? 1 : -1 });

        // نرجعو قائمة les projets الكل
        res.status(200).json({
            message: 'Liste de tous les projets',
            count: projects.length,
            projects
        });

    } catch (error) {
        // كان تصير مشكلة وقت نجيبو les projets
        res.status(500).json({
            message: 'Erreur lors de la récupération des projets',
            error: error.message
        });
    }
};


// 4. عرض projet معيّن باستعمال الـ ID
const getProjectById = async (req, res) => {
    try {
        // ناخذو ID projet من الرابط
        const { id } = req.params;

        // نثبتو اللي الـ ID عندو صيغة صحيحة
        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({
                message: 'ID du projet invalide'
            });
        }

        // نلقاو projet حسب الـ ID وصاحب projet
        const project = await Project.findOne({
            _id: id,
            owner: req.user.id
        });

        // كان projet موش موجود أو موش تابع utilisateur 
        if (!project) {
            return res.status(404).json({
                message: 'Projet introuvable'
            });
        }

        // نرجعو معلومات projet
        res.status(200).json({ project });

    } catch (error) {
        // كان تصير مشكلة وقت نجيبو projet
        res.status(500).json({
            message: 'Erreur lors de la récupération du projet',
            error: error.message
        });
    }
};


// 5. تعديل projet
const updateProject = async (req, res) => {
    try {
        // ناخذو ID projet من الرابط
        const { id } = req.params;

        // نثبتو من صحة الـ ID
        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({
                message: 'ID du projet invalide'
            });
        }

        // ناخذو المعلومات الجديدة
        const { nom, description, statut } = req.body;

        // نلقاو projet اللي يملكه utilisateur الحالي
        const project = await Project.findOne({
            _id: id,
            owner: req.user.id
        });

        // كان projet موش موجود أو موش تابع utilisateur 
        if (!project) {
            return res.status(404).json({
                message: 'Projet introuvable'
            });
        }

        // نثبتو من الاسم كان utilisateur حب يبدلو
        if (nom !== undefined) {
            if (typeof nom !== 'string' || !nom.trim()) {
                return res.status(400).json({
                    message: 'Le nom du projet ne peut pas être vide'
                });
            }

            // نعوضو الاسم القديم بالاسم الجديد
            project.nom = nom.trim();
        }

        // نبدلو الوصف كان user بعث وصف جديد
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

        // نرجعو projrt بعد التعديل
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


// 6. حذف projet
const deleteProject = async (req, res) => {
    try {
        // ناخذو ID projet من الرابط
        const { id } = req.params;

        // نثبتو من صحة الـ ID
        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({
                message: 'ID du projet invalide'
            });
        }

        // نفسخو projet كان تابع l user الحالي
        const project = await Project.findOneAndDelete({
            _id: id,
            owner: req.user.id
        });

        // كان projet موش موجود أو موش تابع utilisateur 
        if (!project) {
            return res.status(404).json({
                message: 'Projet introuvable'
            });
        }

        // نعلمو user اللي الحذف تم بنجاح
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
