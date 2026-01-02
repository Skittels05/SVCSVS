const express = require('express');
const router = express.Router();
const projectMemberController = require('../controllers/projectMemberController');

router.post('/', projectMemberController.create);
router.get('/', projectMemberController.getAll);
router.get('/:id', projectMemberController.getById);
router.put('/:id', projectMemberController.update);
router.delete('/:id', projectMemberController.delete);
router.head('/:id', projectMemberController.checkExists);

module.exports = router;