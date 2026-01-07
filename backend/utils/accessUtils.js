const { Project, ProjectMember, Task } = require('../models');
const { Op } = require('sequelize');

const hasProjectAccess = async (projectId, userId, userRights) => {
  if (userRights === 'admin') return true;

  const project = await Project.findByPk(projectId, {
    attributes: ['id', 'creator_id'],
  });

  if (!project) return false;

  if (project.creator_id === userId) return true;

  const membership = await ProjectMember.findOne({
    where: { project_id: projectId, user_id: userId },
  });

  return !!membership;
};

const hasTaskAccess = async (taskId, userId, userRights) => {
  if (userRights === 'admin') return true;

  const task = await Task.findByPk(taskId, {
    attributes: ['id', 'project_id', 'reporter_id', 'assignee_id'],
    include: [{ model: Project, attributes: ['creator_id'] }],
  });

  if (!task) return false;

  if (await hasProjectAccess(task.project_id, userId, userRights)) {
    return true;
  }

  if (task.reporter_id === userId || task.assignee_id === userId) {
    return true;
  }

  return false;
};

const getAccessibleProjectIds = async (userId, userRights) => {
  if (userRights === 'admin') {
    return null;
  }

  const projects = await Project.findAll({
    attributes: ['id'],
    include: [
      {
        model: ProjectMember,
        required: false,
        where: { user_id: userId },
      },
    ],
    where: {
      [Op.or]: [
        { creator_id: userId },
        { '$ProjectMembers.user_id$': userId },
      ],
    },
  });

  return projects.map(p => p.id);
};

module.exports = {
  hasProjectAccess,
  hasTaskAccess,
  getAccessibleProjectIds,
};