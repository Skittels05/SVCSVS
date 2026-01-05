const sequelize = require('../config/database');

const db = {};

db.sequelize = sequelize;
db.Sequelize = sequelize.constructor;

db.Project = require('./project')(sequelize);
db.User = require('./user')(sequelize);
db.ProjectMember = require('./projectmember')(sequelize);
db.Iteration = require('./iteration')(sequelize);
db.Task = require('./task')(sequelize);
db.Attachment = require('./attachments')(sequelize);
db.UserPassword = require('./userpassword')(sequelize);
db.RefreshToken = require('./refreshtoken')(sequelize);
db.RecoveryToken = require('./recoverytoken')(sequelize);

const {
  Project,
  User,
  ProjectMember,
  Iteration,
  Task,
  Attachment,
} = db;

Project.hasMany(ProjectMember, { foreignKey: 'project_id', onDelete: 'CASCADE' });
User.hasMany(ProjectMember, { foreignKey: 'user_id', onDelete: 'CASCADE' });
ProjectMember.belongsTo(Project, { foreignKey: 'project_id' });
ProjectMember.belongsTo(User, { foreignKey: 'user_id' });

Project.hasMany(Iteration, { foreignKey: 'project_id', onDelete: 'CASCADE' });
Iteration.belongsTo(Project, { foreignKey: 'project_id' });

Project.hasMany(Task, { foreignKey: 'project_id', onDelete: 'CASCADE' });
Task.belongsTo(Project, { foreignKey: 'project_id' });

Iteration.hasMany(Task, { foreignKey: 'iteration_id', onDelete: 'SET NULL' });
Task.belongsTo(Iteration, { foreignKey: 'iteration_id' });

Task.belongsTo(Task, { as: 'ParentTask', foreignKey: 'parent_task_id' });
Task.hasMany(Task, { as: 'SubTasks', foreignKey: 'parent_task_id' });

User.hasMany(Task, { as: 'ReportedTasks', foreignKey: 'reporter_id', onDelete: 'SET NULL' });
Task.belongsTo(User, { as: 'Reporter', foreignKey: 'reporter_id' });

User.hasMany(Task, { as: 'AssignedTasks', foreignKey: 'assignee_id', onDelete: 'SET NULL' });
Task.belongsTo(User, { as: 'Assignee', foreignKey: 'assignee_id' });

Task.hasMany(Attachment, { foreignKey: 'task_id', onDelete: 'CASCADE' });
Attachment.belongsTo(Task, { foreignKey: 'task_id' });

User.hasMany(Attachment, { foreignKey: 'user_id', onDelete: 'SET NULL' });
Attachment.belongsTo(User, { as: 'Uploader', foreignKey: 'user_id' });

User.hasOne(UserPassword, { foreignKey: 'user_id', onDelete: 'CASCADE' });
UserPassword.belongsTo(User, { foreignKey: 'user_id' });

User.hasMany(RefreshToken, { foreignKey: 'user_id', onDelete: 'CASCADE' });
RefreshToken.belongsTo(User, { foreignKey: 'user_id' });

User.hasMany(RecoveryToken, { foreignKey: 'user_id', onDelete: 'CASCADE' });
RecoveryToken.belongsTo(User, { foreignKey: 'user_id' });

db.Project.addHook('beforeUpdate', (instance) => {
  instance.updated_at = new Date();
});

db.Task.addHook('beforeUpdate', (instance) => {
  instance.updated_at = new Date();
});

module.exports = db;