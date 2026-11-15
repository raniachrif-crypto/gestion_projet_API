const Task = require('../models/task');
const Project = require('../models/project');
const User = require('../models/user');
const mongoose = require('mongoose');

// 1. إنشاء مهمة جديدة
exports.createTask = async (req, res) => {
    try {
        // ناخذو المعلومات اللي بعثها المستخدم
        const { titre, description, statut, dateLimite, projet } = req.body;

        // نثبتو اللي العنوان و ID المشروع موجودين
        if (typeof titre !== 'string' || !titre.trim() || !projet) {
            return res.status(400).json({
                message: 'Le titre et le projet sont obligatoires'
            });
        }

        // نثبتو من صحة ID المشروع
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

        // نثبتو من صحة التاريخ كان المستخدم بعثه
        if (dateLimite !== undefined &&
            isNaN(Date.parse(dateLimite))) {
            return res.status(400).json({
                message: 'Date limite invalide'
            });
        }

        // نثبتو اللي المشروع موجود في قاعدة البيانات
        const project = await Project.findById(projet);

        if (!project) {
            return res.status(404).json({
                message: 'Projet introuvable'
            });
        }

        // نثبتو اللي المستخدم هو صاحب المشروع
        if (project.owner.toString() !== req.user.id) {
            return res.status(403).json({
                message: 'Vous ne pouvez pas ajouter une tâche à ce projet'
            });
        }

        // نصنعو المهمة ونربطوها بالمشروع
        const task = await Task.create({
            titre: titre.trim(),
            description,
            statut,
            dateLimite,
            projet
        });

        // نرجعو المهمة بعد ما تتصنع بنجاح
        res.status(201).json({
            message: 'Tâche créée avec succès',
            task
        });

    } catch (error) {
        // كان تصير مشكلة أثناء إنشاء المهمة
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

        // نعملو filter حسب Role متاع المستخدم
        let filter = {};

        if (req.user.role !== 'manager') {

            // نجيبو المشاريع اللي يملكهم المستخدم الحالي
            const projects = await Project.find({
                owner: req.user.id
            }).select('_id');

            // نستخرجو IDs متاع المشاريع
            const projectIds = projects.map(project => project._id);

            // المستخدم العادي يشوف كان المهام متاع مشاريعه
            filter.projet = { $in: projectIds };
        }

        // نثبتو من كلمة البحث
        if (search !== undefined) {
            if (typeof search !== 'string') {
                return res.status(400).json({
                    message: 'Terme de recherche invalide'
                });
            }

            // نبحثو على المهمة حسب العنوان
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

        // نحددو الحقول اللي نسمحو بالترتيب حسبها
        const allowedSortFields = [
            'createdAt',
            'dateLimite',
            'titre'
        ];

        // نثبتو من الحقل المطلوب للترتيب
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

        // نجيبو المهام من MongoDB ونجيبو معاها معلومات المشاريع والمستخدمين
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
        // كان تصير مشكلة وقت جلب المهام
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

        // نثبتو اللي المشروع تابع للمستخدم الحالي
        const project = await Project.findOne({
            _id: task.projet,
            owner: req.user.id
        });

        // كان المستخدم موش صاحب المشروع، نمنعوه من الوصول
        if (!project) {
            return res.status(403).json({
                message: 'Accès interdit à cette tâche'
            });
        }

        // نجيبو اسم المشروع ومعلومات المستخدم المعيّن للمهمة
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

        // نثبتو اللي المستخدم هو صاحب المشروع
        const project = await Project.findOne({
            _id: task.projet,
            owner: req.user.id
        });

        // كان المشروع موش تابع للمستخدم، نمنعوه من التعديل
        if (!project) {
            return res.status(403).json({
                message: 'Accès interdit à cette tâche'
            });
        }

        // نثبتو من العنوان كان المستخدم حب يبدلو
        if (titre !== undefined) {
            if (typeof titre !== 'string' || !titre.trim()) {
                return res.status(400).json({
                    message: 'Le titre ne peut pas être vide'
                });
            }

            // نعوضو العنوان القديم بالجديد
            task.titre = titre.trim();
        }

        // نبدلو الوصف كان المستخدم بعث وصف جديد
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


// 5. حذف مهمة
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

        // نثبتو اللي المستخدم هو صاحب المشروع
        const project = await Project.findOne({
            _id: task.projet,
            owner: req.user.id
        });

        // كان المشروع موش تابع للمستخدم، نمنعوه من الحذف
        if (!project) {
            return res.status(403).json({
                message: 'Accès interdit à cette tâche'
            });
        }

        // نحذفو المهمة من قاعدة البيانات
        await Task.findByIdAndDelete(id);

        // نعلمو المستخدم اللي الحذف تم بنجاح
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


// 6. إسناد مهمة لمستخدم (Manager فقط)
exports.assignTask = async (req, res) => {
    try {
        // ناخذو ID المهمة و ID المستخدم اللي باش نسندولو المهمة
        const { id } = req.params;
        const { assigneA } = req.body;

        // نثبتو اللي المستخدم الحالي عندو Role Manager
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

        // نثبتو اللي المستخدم اللي باش نسندولو المهمة موجود
        const user = await User.findById(assigneA);

        if (!user) {
            return res.status(404).json({
                message: 'Utilisateur introuvable'
            });
        }

        // نسندو المهمة للمستخدم المختار
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
