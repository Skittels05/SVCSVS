const Sequelize = require('sequelize');
const config = require('../config/config')['development'];
const sequelize = new Sequelize(config.database, config.username, config.password, config);

const db = {};
db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.Project = require('./project')(sequelize);
db.User = require('./user')(sequelize);
db.ProjectMember = require('./projectmember')(sequelize);
db.Iteration = require('./iteration')(sequelize);
db.Task = require('./task')(sequelize);
db.Attachment = require('./attachment')(sequelize);

db.Project.hasMany(db.ProjectMember, { foreignKey: 'project_id', onDelete: 'CASCADE' });
db.User.hasMany(db.ProjectMember, { foreignKey: 'user_id', onDelete: 'CASCADE' });
db.ProjectMember.belongsTo(db.Project);
db.ProjectMember.belongsTo(db.User);

db.Project.hasMany(db.Iteration, { foreignKey: 'project_id', onDelete: 'CASCADE' });
db.Iteration.belongsTo(db.Project);

db.Project.hasMany(db.Task, { foreignKey: 'project_id', onDelete: 'CASCADE' });
db.Task.belongsTo(db.Project);
db.Iteration.hasMany(db.Task, { foreignKey: 'iteration_id', onDelete: 'SET NULL' });
db.Task.belongsTo(db.Iteration);
db.Task.belongsTo(db.Task, { as: 'ParentTask', foreignKey: 'parent_task_id', onDelete: 'SET NULL' });
db.Task.hasMany(db.Task, { as: 'SubTasks', foreignKey: 'parent_task_id' });

db.User.hasMany(db.Task, { as: 'ReportedTasks', foreignKey: 'reporter_id', onDelete: 'SET NULL' });
db.Task.belongsTo(db.User, { as: 'Reporter', foreignKey: 'reporter_id' });
db.User.hasMany(db.Task, { as: 'AssignedTasks', foreignKey: 'assignee_id', onDelete: 'SET NULL' });
db.Task.belongsTo(db.User, { as: 'Assignee', foreignKey: 'assignee_id' });

db.Task.hasMany(db.Attachment, { foreignKey: 'task_id', onDelete: 'CASCADE' });
db.Attachment.belongsTo(db.Task);
db.User.hasMany(db.Attachment, { foreignKey: 'user_id', onDelete: 'SET NULL' });
db.Attachment.belongsTo(db.User, { as: 'Uploader' });

module.exports = db;