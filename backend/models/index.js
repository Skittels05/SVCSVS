const mongoose = require('../config/database'); // или просто require('mongoose')

const db = {};

db.mongoose = mongoose;

db.Project = require('./project');
db.User = require('./user');
db.ProjectMember = require('./projectmember');
db.Iteration = require('./iteration');
db.Task = require('./task');
db.Attachment = require('./attachments');

module.exports = db;