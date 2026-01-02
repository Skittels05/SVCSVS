const express = require('express');
const router = express.Router();
const iterationController = require('../controllers/iterationController');

router.post('/', iterationController.create);
router.get('/', iterationController.getAll);
router.get('/:id', iterationController.getById);
router.put('/:id', iterationController.update);
router.delete('/:id', iterationController.delete);
router.head('/:id', iterationController.checkExists);

module.exports = router;