const express = require('express');
const router = express.Router();
const projectController = require('../controllers/projectController');
const projectMemberController = require('../controllers/projectMemberController');

router.post('/', projectController.create);
router.get('/', projectController.getAll);
router.get('/:id', projectController.getById);
router.put('/:id', projectController.update);
router.delete('/:id', projectController.delete);
router.head('/:id', projectController.checkExists);
router.get('/:project_id/members', projectMemberController.getMembersByProject);

module.exports = router;