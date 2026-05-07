const Project = require('../models/Project');
const Task = require('../models/Task');

exports.getSummary = async (req, res, next) => {
  try {
    const projectFilter = req.user.role === 'Admin'
      ? {}
      : { $or: [{ members: req.user._id }, { createdBy: req.user._id }] };

    const accessibleProjectIds = req.user.role === 'Admin'
      ? []
      : await Project.distinct('_id', projectFilter);

    const taskFilter = req.user.role === 'Admin'
      ? {}
      : {
          $or: [
            { assignedTo: req.user._id },
            { project: { $in: accessibleProjectIds } },
          ],
        };

    const [projects, tasks, recentTasks, recentProjects] = await Promise.all([
      Project.countDocuments(projectFilter),
      Task.find(taskFilter).sort({ updatedAt: -1 }).populate('assignedTo', 'name email').populate('project', 'title').limit(50),
      Task.find(taskFilter).sort({ updatedAt: -1 }).populate('assignedTo', 'name email').populate('project', 'title').limit(5),
      Project.find(projectFilter).sort({ updatedAt: -1 }).populate('members', 'name email').limit(5),
    ]);

    const completedTasks = tasks.filter((task) => task.status === 'Done').length;
    const pendingTasks = tasks.filter((task) => task.status !== 'Done').length;
    const overdueTasks = tasks.filter((task) => task.deadline && new Date(task.deadline) < new Date() && task.status !== 'Done').length;

    res.json({
      projects,
      completedTasks,
      pendingTasks,
      overdueTasks,
      recentTasks,
      recentProjects,
    });
  } catch (err) {
    next(err);
  }
};
