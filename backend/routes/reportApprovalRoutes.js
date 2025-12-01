const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middlewares/authMiddleware');
const {
  listPendingReports,
  approveReport,
  rejectReport,
  getApprovalStatus
} = require('../controllers/reportApprovalController');

router.use(protect);

router.get('/:id/approval-status', getApprovalStatus);

router.use(admin);

router.get('/approval/pending', listPendingReports);
router.put('/:id/approve', approveReport);
router.put('/:id/reject', rejectReport);

module.exports = router; 