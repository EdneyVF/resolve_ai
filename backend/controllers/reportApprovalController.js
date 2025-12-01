const asyncHandler = require('express-async-handler');
const Report = require('../models/Report');
const ErrorResponse = require('../utils/errorResponse');

const listPendingReports = asyncHandler(async (req, res) => {
  const reports = await Report.find({ approvalStatus: 'pending' })
    .populate('organizer', 'name email')
    .populate('category', 'name')
    .sort('-createdAt');

  res.json({
    success: true,
    count: reports.length,
    reports
  });
});

const approveReport = asyncHandler(async (req, res) => {
  const report = await Report.findById(req.params.id);

  if (!report) {
    throw new ErrorResponse('Relato não encontrado', 404);
  }

  if (report.approvalStatus !== 'pending') {
    throw new ErrorResponse('Relato não está pendente de aprovação', 400);
  }

  await report.approve(req.user._id);

  res.json({
    _id: report._id,
    approvalStatus: report.approvalStatus,
    status: report.status,
    approvedBy: report.approvedBy,
    approvalDate: report.approvalDate
  });
});

const rejectReport = asyncHandler(async (req, res) => {
  const { reason } = req.body;

  if (!reason) {
    throw new ErrorResponse('Motivo da rejeição é obrigatório', 400);
  }

  const report = await Report.findById(req.params.id);

  if (!report) {
    throw new ErrorResponse('Relato não encontrado', 404);
  }

  if (report.approvalStatus !== 'pending') {
    throw new ErrorResponse('Relato não está pendente de aprovação', 400);
  }

  await report.reject(req.user._id, reason);

  res.json({
    _id: report._id,
    approvalStatus: report.approvalStatus,
    status: report.status,
    rejectionReason: report.rejectionReason
  });
});

const getApprovalStatus = asyncHandler(async (req, res) => {
  const report = await Report.findById(req.params.id)
    .select('approvalStatus status approvedBy approvalDate rejectionReason')
    .populate('approvedBy', 'name');

  if (!report) {
    throw new ErrorResponse('Relato não encontrado', 404);
  }

  res.json({
    _id: report._id,
    approvalStatus: report.approvalStatus,
    status: report.status,
    approvedBy: report.approvedBy,
    approvalDate: report.approvalDate,
    rejectionReason: report.rejectionReason
  });
});

module.exports = {
  listPendingReports,
  approveReport,
  rejectReport,
  getApprovalStatus
}; 