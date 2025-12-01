const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middlewares/authMiddleware');
const {
  searchReports,
  createReport,
  getReportById,
  updateReport,
  deleteReport,
  cancelReport,
  getUserReports,
  listAllReports,
  activateReport,
  deactivateReport
} = require('../controllers/reportController');

router.get('/', searchReports);

router.use(protect);

router.get('/admin/all', admin, listAllReports);

router.get('/my-reports', getUserReports);

router.post('/', createReport);
router.get('/:id', getReportById);
router.put('/:id', updateReport);
router.delete('/:id', deleteReport);

router.put('/:id/cancel', cancelReport);

router.put('/:id/activate', admin, activateReport);
router.put('/:id/deactivate', admin, deactivateReport);

module.exports = router; 