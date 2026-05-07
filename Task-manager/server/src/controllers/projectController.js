const { validationResult } = require('express-validator');
const mongoose = require('mongoose');
const Project = require('../models/Project');
const Task = require('../models/Task');
const User = require('../models/User');

const resolveMemberIds = async (members = []) => {
  if (!Array.isArray(members) || members.length === 0) return [];

  const resolved = [];
  for (const member of members) {
    if (!member) continue;
    const query = mongoose.isValidObjectId(member)
      ? { _id: member }
      : { email: String(member).toLowerCase() };
    // Sequential lookup keeps the logic simple and avoids shipping invalid member ids.
    // eslint-disable-next-line no-await-in-loop
    const user = await User.findOne(query).select('_id');
    if (user) resolved.push(String(user._id));
  }
  return [...new Set(resolved)];
};

exports.createProject = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  try {
    const { title, description, members } = req.body;
    const memberIds = await resolveMemberIds(members);
    const project = await Project.create({ title, description, members: memberIds, createdBy: req.user._id });
    res.status(201).json(project);
  } catch (err) {
    next(err);
  }
};

exports.getProjects = async (req, res, next) => {
  try {
    // Admins see all; members see projects where they are member or creator
    let projects;
    if (req.user.role === 'Admin') {
      projects = await Project.find().populate('members', 'name email');
    } else {
      projects = await Project.find({ $or: [{ members: req.user._id }, { createdBy: req.user._id }] }).populate('members', 'name email');
    }
    res.json(projects);
  } catch (err) {
    next(err);
  }
};

exports.getProjectById = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id).populate('members', 'name email');
    if (!project) return res.status(404).json({ message: 'Project not found' });
    // ensure member or admin
    if (req.user.role !== 'Admin' && !project.members.some((m) => m._id.equals(req.user._id)) && !project.createdBy.equals(req.user._id)) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    const tasks = await Task.find({ project: project._id }).populate('assignedTo', 'name email');
    res.json({ project, tasks });
  } catch (err) {
    next(err);
  }
};

exports.updateProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });
    const { title, description, members } = req.body;
    if (title) project.title = title;
    if (description) project.description = description;
    if (members) project.members = await resolveMemberIds(members);
    await project.save();
    res.json(project);
  } catch (err) {
    next(err);
  }
};

exports.deleteProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });
    await Task.deleteMany({ project: project._id });
    await Project.findByIdAndDelete(project._id);
    res.json({ message: 'Project and tasks deleted' });
  } catch (err) {
    next(err);
  }
};
