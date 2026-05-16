const express = require('express');
const signController = require('../controllers/signcontroller');

const router = express.Router();

router.post('/signup', signController.signup);
router.post('/login', signController.login);
router.post('/logout', signController.logout);

module.exports = router;
