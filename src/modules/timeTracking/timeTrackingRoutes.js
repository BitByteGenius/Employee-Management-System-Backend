const express = require('express');
const { getTimeLogs, createTimeLog } = require('./timeTrackingController');
const authMiddleware = require('../../middlewares/auth.middleware');

const router = express.Router();

router.get('/', authMiddleware, getTimeLogs);
router.post('/', authMiddleware, createTimeLog);

module.exports = router;
