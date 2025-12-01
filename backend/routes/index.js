const express = require('express');
const router = express.Router();

const authRoutes = require('./authRoutes');
const reportRoutes = require('./reportRoutes');
const categoryRoutes = require('./categoryRoutes');
const reportApprovalRoutes = require('./reportApprovalRoutes');
const userRoutes = require('./userRoutes');

router.use('/api/auth', authRoutes);
router.use('/api/reports', reportRoutes);
router.use('/api/categories', categoryRoutes);
router.use('/api/reports', reportApprovalRoutes);
router.use('/api/users', userRoutes);

module.exports = router; 