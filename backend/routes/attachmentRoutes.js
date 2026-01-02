const express = require('express');
const router = express.Router();
const attachmentController = require('../controllers/attachmentController');

router.post('/', attachmentController.create);
router.get('/', attachmentController.getAll);
router.get('/:id', attachmentController.getById);
router.put('/:id', attachmentController.update);
router.delete('/:id', attachmentController.delete);
router.head('/:id', attachmentController.checkExists);

module.exports = router;