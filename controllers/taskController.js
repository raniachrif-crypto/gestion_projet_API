const Task = require('../models/task');
const Project = require('../models/project');
const User = require('../models/user');
const mongoose = require('mongoose');

// 1. نصنعو مهمة جديدة
exports.createTask = async (req, res) => {
    try {
        // ناخذو المعلومات اللي بعثها user
        const { titre, description, statut, dateLimite, projet } = req.body;

        // نثبتو اللي العنوان و ID projet موجودين
        if (typeof titre !== 'string' || !titre.trim() || !projet) {
            return res.status(400).json({
                message: 'Le titre et le projet sont obligatoires'
            });
        }

        // نثبتو من صحة ID projet
        if (!mongoose.isValidObjectId(projet)) {
            return res.status(400).json({
                message: 'ID du projet invalide'
            });
        }

        // نثبتو اللي الحالة من الحالات المسموح بيها
        if (statut !== undefined &&
            !['todo', 'doing', 'done'].includes(statut)) {
            return res.status(400).json({
                message: 'Statut invalide'
            });
        }

        // نثبتو من صحة التاريخ كان utilisateur بعثه
        if (dateLimite !== undefined &&
            isNaN(Date.parse(dateLimite))) {
            return res.status(400).json({
                message: 'Date limite invalide'
            });
        }

        // نثبتو اللي projet موجود في قاعدة البيانات
        const project = await Project.findById(projet);

        if (!project) {
            return res.status(404).json({
                message: 'Projet introuvable'
            });
        }

        // نثبتو اللي user هو صاحب l projet
        if (project.owner.toString() !== req.user.id) {
            return res.status(403).json({
                message: 'Vous ne pouvez pas ajouter une tâche à ce projet'
            });
        }

        // نصنعو المهمة ونربطوها ب projet
        const task = await Task.create({
            titre: titre.trim(),
            description,
            statut,
            dateLimite,
            projet
        });

        // نرجعو المهمة بعد ما تتصنع 
        res.status(201).json({
            message: 'Tâche créée avec succès',
            task
        });

    } catch (error) {
        // كان تصير مشكلة وقت نعملو المهمة
        res.status(500).json({
            message: 'Erreur lors de la création de la tâche',
            error: error.message
        });
    }
};


// 2. عرض المهام مع البحث والفلترة والترتيب
exports.getTasks = async (req, res) => {
    try {
        // ناخذو خيارات البحث والفلترة والترتيب من الرابط
        const {
            search,
            statut,
            sortBy = 'createdAt',
            order = 'desc'
        } = req.query;

        // نعملو filter حسب Role متاع utilisateur
        let filter = {};

        if (req.user.role !== 'manager') {

            // نجيبو les projets اللي يملكهم user الحالي
            const projects = await Project.find({
                owner: req.user.id
            }).select('_id');

            // نستخرجو IDs متاع les projets
            const projectIds = projects.map(project => project._id);

            // user العادي يشوف كان المهام متاع projets mte3o
            filter.projet = { $in: projectIds };
        }

        // نثبتو من كلمة البحث
        if (search !== undefined) {
            if (typeof search !== 'string') {
                return res.status(400).json({
                    message: 'Terme de recherche invalide'
                });
            }

            // نلوجو  على المهمة حسب العنوان
            if (search.trim()) {
                filter.titre = {
                    $regex: search.trim(),
                    $options: 'i'
                };
            }
        }

        // نثبتو من الحالة المطلوبة
        if (statut !== undefined) {
            if (!['todo', 'doing', 'done'].includes(statut)) {
                return res.status(400).json({
                    message: 'Statut invalide'
                });
            }

            // نزيدو الحالة للفلتر
            filter.statut = statut;
        }

        // نحددو les champs اللي نسمحو بالترتيب حسبها
        const allowedSortFields = [
            'createdAt',
            'dateLimite',
            'titre'
        ];

        // نثبتو من champs المطلوب للترتيب
        if (!allowedSortFields.includes(sortBy)) {
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

        // نحددو اتجاه الترتيب: تصاعدي أو تنازلي
        const direction = order === 'asc' ? 1 : -1;

        // نجيبو المهام من MongoDB ونجيبو معاها معلومات les projets والمستخدمين
        const tasks = await Task.find(filter)
            .populate('projet', 'nom')
            .populate('assigneA', 'nom login')
            .sort({ [sortBy]: direction });

        // نرجعو عدد المهام والقائمة متاعهم
        res.status(200).json({
            nombre: tasks.length,
            tasks
        });

    } catch (error) {
        // كان تصير مشكلة وقت نجيبو  المهام
        res.status(500).json({
            message: 'Erreur lors de la récupération des tâches',
            error: error.message
        });
    }
};


// 3. عرض مهمة معيّنة باستعمال ID
exports.getTaskById = async (req, res) => {
    try {
        // ناخذو ID المهمة من الرابط
        const { id } = req.params;

        // نثبتو من صحة ID
        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({
                message: 'ID de la tâche invalide'
            });
        }

        // نلقاو المهمة حسب ID
        const task = await Task.findById(id);

        // كان المهمة موش موجودة
        if (!task) {
            return res.status(404).json({
                message: 'Tâche introuvable'
            });
        }

        // نثبتو اللي projet تابع ll user الحالي
        const project = await Project.findOne({
            _id: task.projet,
            owner: req.user.id
        });

        // كان user موش صاحب projet نمنعوه من الوصول
        if (!project) {
            return res.status(403).json({
                message: 'Accès interdit à cette tâche'
            });
        }

        // نجيبو اسم l projet ومعلومات l user المعيّن للمهمة
        await task.populate('projet', 'nom');
        await task.populate('assigneA', 'nom login');

        // نرجعو معلومات المهمة
        res.status(200).json(task);

    } catch (error) {
        // كان تصير مشكلة وقت جلب المهمة
        res.status(500).json({
            message: 'Erreur lors de la récupération de la tâche',
            error: error.message
        });
    }
};


// 4. تعديل مهمة
exports.updateTask = async (req, res) => {
    try {
        // ناخذو ID المهمة والمعلومات الجديدة
        const { id } = req.params;
        const { titre, description, statut, dateLimite } = req.body;

        // نثبتو من صحة ID
        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({
                message: 'ID de la tâche invalide'
            });
        }

        // نلقاو المهمة في قاعدة البيانات
        const task = await Task.findById(id);

        // كان المهمة موش موجودة
        if (!task) {
            return res.status(404).json({
                message: 'Tâche introuvable'
            });
        }

        // نثبتو اللي l user هو صاحب l projet
        const project = await Project.findOne({
            _id: task.projet,
            owner: req.user.id
        });

        // كان projet موش تابع ll user نمنعوه من التعديل
        if (!project) {
            return res.status(403).json({
                message: 'Accès interdit à cette tâche'
            });
        }

        // نثبتو من العنوان كان utilisateur حب يبدلو
        if (titre !== undefined) {
            if (typeof titre !== 'string' || !titre.trim()) {
                return res.status(400).json({
                    message: 'Le titre ne peut pas être vide'
                });
            }

            // نعوضو العنوان القديم بالجديد
            task.titre = titre.trim();
        }

        // نبدلو الوصف كان utilisateur بعث وصف جديد
        if (description !== undefined) {
            task.description = description;
        }

        // نثبتو من الحالة الجديدة
        if (statut !== undefined) {
            if (!['todo', 'doing', 'done'].includes(statut)) {
                return res.status(400).json({
                    message: 'Statut invalide'
                });
            }

            // نعوضو الحالة القديمة بالحالة الجديدة
            task.statut = statut;
        }

        // نثبتو من التاريخ الجديد
        if (dateLimite !== undefined) {
            const date = new Date(dateLimite);

            if (isNaN(date.getTime())) {
                return res.status(400).json({
                    message: 'Date limite invalide'
                });
            }

            // نعوضو التاريخ القديم بالجديد
            task.dateLimite = date;
        }

        // نسجلو التغييرات في قاعدة البيانات
        await task.save();

        // نرجعو المهمة بعد التعديل
        res.status(200).json({
            message: 'Tâche modifiée avec succès',
            task
        });

    } catch (error) {
        // كان تصير مشكلة وقت تعديل المهمة
        res.status(500).json({
            message: 'Erreur lors de la modification de la tâche',
            error: error.message
        });
    }
};


// 5. نفسخ مهمة
exports.deleteTask = async (req, res) => {
    try {
        // ناخذو ID المهمة من الرابط
        const { id } = req.params;

        // نثبتو من صحة ID
        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({
                message: 'ID de la tâche invalide'
            });
        }

        // نلقاو المهمة في قاعدة البيانات
        const task = await Task.findById(id);

        // كان المهمة موش موجودة
        if (!task) {
            return res.status(404).json({
                message: 'Tâche introuvable'
            });
        }

        // نثبتو اللي user هو صاحب lprojet
        const project = await Project.findOne({
            _id: task.projet,
            owner: req.user.id
        });

        // كان l projet موش تابع ll user نمنعوه من الحذف
        if (!project) {
            return res.status(403).json({
                message: 'Accès interdit à cette tâche'
            });
        }

        // نحذفو المهمة من قاعدة البيانات
        await Task.findByIdAndDelete(id);

        // نعلمو user اللي الحذف تم بنجاح
        res.status(200).json({
            message: 'Tâche supprimée avec succès'
        });

    } catch (error) {
        // كان تصير مشكلة وقت حذف المهمة
        res.status(500).json({
            message: 'Erreur lors de la suppression de la tâche',
            error: error.message
        });
    }
};


// 6. إسناد مهمة لمستخدم (manager برك)
exports.assignTask = async (req, res) => {
    try {
        // ناخذو ID المهمة و ID user اللي باش نسندولو المهمة
        const { id } = req.params;
        const { assigneA } = req.body;

        // نثبتو اللي l user الحالي عندو role manager
        if (req.user.role !== 'manager') {
            return res.status(403).json({
                message: 'Seul le manager peut assigner une tâche'
            });
        }

        // نثبتو اللي IDs موجودين وعندهم صيغة صحيحة
        if (!assigneA || !mongoose.isValidObjectId(id) ||
            !mongoose.isValidObjectId(assigneA)) {
            return res.status(400).json({
                message: 'ID de la tâche ou de l’utilisateur invalide'
            });
        }

        // نثبتو اللي المهمة موجودة
        const task = await Task.findById(id);

        if (!task) {
            return res.status(404).json({
                message: 'Tâche introuvable'
            });
        }

        // نثبتو اللي user اللي باش نسندولو المهمة موجود
        const user = await User.findById(assigneA);

        if (!user) {
            return res.status(404).json({
                message: 'Utilisateur introuvable'
            });
        }

        // نسندو المهمة ll user لي خترناه
        task.assigneA = assigneA;

        // نسجلو التغيير في قاعدة البيانات
        await task.save();

        // نرجعو النتيجة بعد الإسناد
        res.status(200).json({
            message: 'Tâche assignée avec succès',
            task
        });

    } catch (error) {
        // كان تصير مشكلة وقت إسناد المهمة
        res.status(500).json({
            message: "Erreur lors de l'assignation de la tâche",
            error: error.message
        });
    }
};
