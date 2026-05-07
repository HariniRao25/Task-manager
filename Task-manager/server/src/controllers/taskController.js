const { validationResult } = require('express-validator');
const Task = require('../models/Task');
const Project = require('../models/Project');
const User = require('../models/User');

const canAccessProject = (project, user) => {
  if (user.role === 'Admin') return true;
  return project.createdBy.equals(user._id) || project.members.some((memberId) => memberId.equals(user._id));
};

const canEditTask = (task, user) => {
  if (user.role === 'Admin') return true;
  return task.assignedTo && task.assignedTo.equals(user._id);
};

exports.createTask = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  try {
    const { title, description, assignedTo, priority, deadline, project } = req.body;
    const proj = await Project.findById(project);
    if (!proj) return res.status(404).json({ message: 'Project not found' });
    // only Admins or project members can create tasks
    if (!canAccessProject(proj, req.user)) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    if (assignedTo) {
      const assignedUser = await User.findById(assignedTo).select('_id');
      const isProjectMember = assignedUser && proj.members.some((memberId) => memberId.equals(assignedUser._id));
      if (!assignedUser || (!isProjectMember && req.user.role !== 'Admin')) {
        return res.status(400).json({ message: 'Assigned user must belong to the project' });
      }
    }

    const task = await Task.create({ title, description, assignedTo, priority, deadline, project });
    res.status(201).json(task);
  } catch (err) {
    next(err);
  }
};

exports.getTasks = async (req, res, next) => {
  try {
    const projects = req.user.role === 'Admin'
      ? []
      : await Project.find({ $or: [{ members: req.user._id }, { createdBy: req.user._id }] }).select('_id');

    const filter = {};
    if (req.query.project) filter.project = req.query.project;
    if (req.query.status) filter.status = req.query.status;
    if (req.query.priority) filter.priority = req.query.priority;
    if (req.query.assignedTo) filter.assignedTo = req.query.assignedTo;
    if (req.query.q) {
      filter.$or = [
        { title: { $regex: req.query.q, $options: 'i' } },
        { description: { $regex: req.query.q, $options: 'i' } },
      ];
    }

    // Members can see tasks in their projects and tasks directly assigned to them.
    if (req.user.role !== 'Admin') {
      const projectIds = projects.map((project) => project._id);
      filter.$or = [
        ...(filter.$or || []),
        { project: { $in: projectIds } },
        { assignedTo: req.user._id },
      ];
    }

    const tasks = await Task.find(filter)
      .sort({ updatedAt: -1 })
      .populate('assignedTo', 'name email role')
      .populate('project', 'title members createdBy');
    res.json(tasks);
  } catch (err) {
    next(err);
  }
};

exports.getTaskById = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('assignedTo', 'name email role')
      .populate('project', 'title members createdBy');
    if (!task) return res.status(404).json({ message: 'Task not found' });

    const project = task.project;
    if (req.user.role !== 'Admin' && !canAccessProject(project, req.user) && !task.assignedTo?.equals(req.user._id)) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    res.json(task);
  } catch (err) {
    next(err);
  }
};

exports.updateTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id).populate('project');
    if (!task) return res.status(404).json({ message: 'Task not found' });
    // Only Admin or assigned user can update certain fields
    if (!canEditTask(task, req.user) && !canAccessProject(task.project, req.user)) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    const { title, description, status, priority, assignedTo, deadline } = req.body;
    if (title) task.title = title;
    if (description) task.description = description;
    if (status) task.status = status;
    if (priority) task.priority = priority;
    if (assignedTo) {
      const assignedUser = await User.findById(assignedTo).select('_id');
      if (!assignedUser) return res.status(400).json({ message: 'Invalid assigned user' });
      const isProjectMember = task.project.members.some((memberId) => memberId.equals(assignedUser._id));
      if (!isProjectMember && req.user.role !== 'Admin') {
        return res.status(400).json({ message: 'Assigned user must belong to the project' });
      }
      task.assignedTo = assignedUser._id;
    }
    if (deadline) task.deadline = deadline;
    await task.save();
    res.json(task);
  } catch (err) {
    next(err);
  }
};

exports.deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id).populate('project');
    if (!task) return res.status(404).json({ message: 'Task not found' });
    // Only admin or assigned user
    if (!canEditTask(task, req.user) && !canAccessProject(task.project, req.user)) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    await Task.findByIdAndDelete(task._id);
    res.json({ message: 'Task deleted' });
  } catch (err) {
    next(err);
  }
};
