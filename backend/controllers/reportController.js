const Report = require('../models/Report');
const User = require('../models/User');
const Category = require('../models/Category');
const asyncHandler = require('express-async-handler');
const ErrorResponse = require('../utils/errorResponse');

const searchReports = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const startIndex = (page - 1) * limit;

  let query = {};

  if (req.query.q) {
    query.$text = { $search: req.query.q };
  } else if (req.query.search) {

    query.$or = [
      { title: { $regex: req.query.search, $options: 'i' } },
      { description: { $regex: req.query.search, $options: 'i' } }
    ];
  }

  if (req.query.categories) {
    const categoryIds = req.query.categories.split(',');
    query.category = { $in: categoryIds };
  } else if (req.query.category) {
    query.category = req.query.category;
  }

  if (req.query.status) {
    query.status = req.query.status;
  }

  let hasDateFilter = false;
  
  if (req.query.from || req.query.to || req.query.startDate || req.query.endDate) {
    query.date = {};
    hasDateFilter = true;

    if (req.query.startDate) {
      query.date.$gte = new Date(req.query.startDate);
    } else if (req.query.from) {
      query.date.$gte = new Date(req.query.from);
    }
    
    if (req.query.endDate) {
      query.date.$lte = new Date(req.query.endDate);
    } else if (req.query.to) {
      query.date.$lte = new Date(req.query.to);
    }
  }

  if (req.query.period && !hasDateFilter) {
    const today = new Date();
    const future = new Date();
    const days = parseInt(req.query.period, 10) || 30;
    future.setDate(today.getDate() + days);
    
    query.date = { 
      $gte: today,
      $lte: future
    };
  }

  if (req.query.location) {
    const location = req.query.location;
    query.$or = [
      { 'location.city': { $regex: location, $options: 'i' } },
      { 'location.state': { $regex: location, $options: 'i' } },
      { 'location.country': { $regex: location, $options: 'i' } }
    ];
  } else {

    if (req.query.city) {
      query['location.city'] = { $regex: req.query.city, $options: 'i' };
    }
    if (req.query.state) {
      query['location.state'] = { $regex: req.query.state, $options: 'i' };
    }
    if (req.query.country) {
      query['location.country'] = { $regex: req.query.country, $options: 'i' };
    }
  }

  if (req.query.minPrice || req.query.maxPrice) {
    query.price = {};
    if (req.query.minPrice) {
      query.price.$gte = parseFloat(req.query.minPrice);
    }
    if (req.query.maxPrice) {
      query.price.$lte = parseFloat(req.query.maxPrice);
    }
  }

  if (req.query.free === 'true') {
    query.price = 0;
  }

  if (req.query.tags) {
    const tagsList = req.query.tags.split(',').map(tag => tag.trim());
    query.tags = { $in: tagsList };
  }

  if (!req.user || req.user.role !== 'admin') {
    query.approvalStatus = 'approved';

    if (!req.query.status) {
      query.status = 'active';
    }
  }

  let sortOption = {};

  if (req.query.q) {
    sortOption = { score: { $meta: 'textScore' } };
  } else {

    switch (req.query.sort) {
      case 'date_asc':
      case 'date': // Compatibilidade
        sortOption = { date: 1 };
        break;
      case 'date_desc':
        sortOption = { date: -1 };
        break;
      case 'price_asc':
        sortOption = { price: 1 };
        break;
      case 'price_desc':
        sortOption = { price: -1 };
        break;
      case 'recent':
        sortOption = { createdAt: -1 };
        break;
      default:
        sortOption = { date: 1 }; // Padrão: próximos relatos primeiro
    }
  }

  const total = await Report.countDocuments(query);

  const projection = req.query.q ? { score: { $meta: 'textScore' } } : {};
  
  const reports = await Report.find(query, projection)
    .populate('category', 'name')
    .populate('organizer', 'name email')
    .sort(sortOption)
    .skip(startIndex)
    .limit(limit);
  
  res.json({
    reports,
    page,
    pages: Math.ceil(total / limit),
    total,
    filters: {
      textSearch: !!(req.query.q || req.query.search),
      location: req.query.location || null,
      city: req.query.city || null,
      state: req.query.state || null, 
      country: req.query.country || null,
      dateRange: !!(req.query.from || req.query.to || req.query.startDate || req.query.endDate),
      period: req.query.period ? parseInt(req.query.period, 10) : null,
      price: !!(req.query.minPrice || req.query.maxPrice || req.query.free),
      category: req.query.category || (req.query.categories ? 'multiple' : null),
      hasAvailability: req.query.hasAvailability === 'true'
    }
  });
});

const createReport = asyncHandler(async (req, res) => {
  const {
    title,
    description,
    imageUrl,
    date,
    location,
    category,
    tags
  } = req.body;

  if (!title || !description || !date || !location || !category) {
    throw new ErrorResponse('Título, descrição, data, localização e categoria são obrigatórios', 400);
  }

  if (title.length < 3 || title.length > 100) {
    throw new ErrorResponse('Título deve ter entre 3 e 100 caracteres', 400);
  }

  if (description.length < 10) {
    throw new ErrorResponse('Descrição deve ter pelo menos 10 caracteres', 400);
  }

  const categoryExists = await Category.findById(category);
  if (!categoryExists) {
    throw new ErrorResponse('Categoria não encontrada', 404);
  }

  if (!categoryExists.active) {
    throw new ErrorResponse('Esta categoria está inativa e não pode ser usada', 400);
  }

  if (!location.address || !location.city || !location.state) {
    throw new ErrorResponse('Endereço, cidade e estado são obrigatórios', 400);
  }

  let reportDate;
  try {
    reportDate = new Date(date);
    if (isNaN(reportDate.getTime())) {
      throw new Error();
    }
  } catch (error) {
    throw new ErrorResponse('Formato de data inválido', 400);
  }
  
  if (imageUrl) {
    const urlPattern = /^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/i;
    if (!urlPattern.test(imageUrl)) {
      throw new ErrorResponse('URL de imagem inválida', 400);
    }
  }

  let reportTags = [];
  if (tags) {
    if (Array.isArray(tags)) {
      reportTags = tags;
    } else if (typeof tags === 'string') {
      reportTags = tags.split(',').map(tag => tag.trim());
    }

    if (reportTags.length > 10) {
      throw new ErrorResponse('Máximo de 10 tags permitidas', 400);
    }

    reportTags.forEach(tag => {
      if (tag.length < 3 || tag.length > 30) {
        throw new ErrorResponse('Cada tag deve ter entre 3 e 30 caracteres', 400);
      }
    });
  }

  const reportData = {
    title,
    description,
    imageUrl,
    date: reportDate,
    location,
    category,
    organizer: req.user._id,
    approvalStatus: req.user.role === 'admin' ? 'approved' : 'pending',
    tags: reportTags
  };

  reportData.status = reportData.approvalStatus === 'approved' ? 'active' : 'inactive';

  const report = await Report.create(reportData);

  const populatedReport = await Report.findById(report._id)
    .populate('category', 'name')
    .populate('organizer', 'name email');

  const result = populatedReport.toObject();
  result.needsApproval = result.approvalStatus === 'pending';

  res.status(201).json({
    success: true,
    message: result.needsApproval 
      ? 'Relato criado com sucesso e aguardando aprovação' 
      : 'Relato criado com sucesso',
    report: result
  });
});

const getReportById = asyncHandler(async (req, res) => {
  const report = await Report.findById(req.params.id)
    .populate('category', 'name')
    .populate('organizer', 'name email')
    .populate('approvedBy', 'name');

  if (!report) {
    throw new ErrorResponse('Relato não encontrado', 404);
  }

  if (report.approvalStatus !== 'approved' && 
      (!req.user || 
       (req.user.role !== 'admin' && 
        report.organizer._id.toString() !== req.user._id.toString()))) {
    throw new ErrorResponse('Relato não disponível', 403);
  }

  res.json(report);
});

const updateReport = asyncHandler(async (req, res) => {
  let report = await Report.findById(req.params.id);

  if (!report) {
    throw new ErrorResponse('Relato não encontrado', 404);
  }

  if (report.organizer.toString() !== req.user._id.toString() && 
      req.user.role !== 'admin') {
    throw new ErrorResponse('Não autorizado', 403);
  }

  if (report.status === 'canceled') {
    throw new ErrorResponse('Não é possível alterar relatos cancelados', 400);
  }

  if (req.body.category) {
    const categoryExists = await Category.findById(req.body.category);
    if (!categoryExists) {
      throw new ErrorResponse('Categoria não encontrada', 404);
    }
  }

  console.log('Valor recebido para imageUrl:', req.body.imageUrl);

  if (req.body.imageUrl === null) {
    console.log('Setting imageUrl to null');
  }

  if (req.user.role === 'admin') {
    req.body.approvalStatus = 'approved';
    req.body.approvedBy = req.user._id;
    req.body.approvalDate = new Date();
    req.body.status = 'active';
  } else {

    req.body.approvalStatus = 'pending';
    req.body.approvedBy = null;
    req.body.approvalDate = null;

    req.body.status = 'inactive';
  }

  report = await Report.findByIdAndUpdate(
    req.params.id,
    { $set: req.body },
    { new: true, runValidators: true }
  )
    .populate('category', 'name')
    .populate('organizer', 'name email');

  res.json({
    success: true,
    message: report.approvalStatus === 'pending' 
      ? 'Relato atualizado com sucesso e aguardando aprovação' 
      : 'Relato atualizado com sucesso',
    report
  });
});

const deleteReport = asyncHandler(async (req, res) => {
  const report = await Report.findById(req.params.id);

  if (!report) {
    throw new ErrorResponse('Relato não encontrado', 404);
  }

  if (report.organizer.toString() !== req.user._id.toString() && 
      req.user.role !== 'admin') {
    throw new ErrorResponse('Não autorizado', 403);
  }

  await report.deleteOne();

  res.json({
    success: true,
    message: 'Relato deletado com sucesso'
  });
});

const cancelReport = asyncHandler(async (req, res) => {
  const report = await Report.findById(req.params.id);

  if (!report) {
    throw new ErrorResponse('Relato não encontrado', 404);
  }

  if (report.organizer.toString() !== req.user._id.toString() && 
      req.user.role !== 'admin') {
    throw new ErrorResponse('Não autorizado', 403);
  }

  if (report.status === 'canceled') {
    throw new ErrorResponse('Relato já está cancelado', 400);
  }

  report.status = 'canceled';
  await report.save();

  res.json({
    success: true,
    message: 'Relato cancelado com sucesso'
  });
});

const getUserReports = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const startIndex = (page - 1) * limit;

  const query = {
    organizer: req.user._id
  };

  if (req.query.status && ['active', 'inactive', 'canceled', 'finished'].includes(req.query.status)) {
    query.status = req.query.status;
  }

  if (req.query.approvalStatus && ['pending', 'approved', 'rejected'].includes(req.query.approvalStatus)) {
    query.approvalStatus = req.query.approvalStatus;
  }

  const total = await Report.countDocuments(query);

  const reports = await Report.find(query)
    .populate('category', 'name')
    .sort({ createdAt: -1 }) // Ordenar por data de criação (mais recente primeiro)
    .skip(startIndex)
    .limit(limit);

  res.json({
    reports,
    page,
    pages: Math.ceil(total / limit),
    total,
    counts: {
      total: await Report.countDocuments({ organizer: req.user._id }),
      active: await Report.countDocuments({ organizer: req.user._id, status: 'active' }),
      inactive: await Report.countDocuments({ organizer: req.user._id, status: 'inactive' }),
      canceled: await Report.countDocuments({ organizer: req.user._id, status: 'canceled' }),
      finished: await Report.countDocuments({ organizer: req.user._id, status: 'finished' }),
      pending: await Report.countDocuments({ organizer: req.user._id, approvalStatus: 'pending' }),
      approved: await Report.countDocuments({ organizer: req.user._id, approvalStatus: 'approved' }),
      rejected: await Report.countDocuments({ organizer: req.user._id, approvalStatus: 'rejected' })
    }
  });
});

const listAllReports = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const startIndex = (page - 1) * limit;

  let query = {};

  if (req.query.search) {
    query.$or = [
      { title: { $regex: req.query.search, $options: 'i' } },
      { description: { $regex: req.query.search, $options: 'i' } }
    ];
  }

  if (req.query.categories) {
    const categoryIds = req.query.categories.split(',');
    query.category = { $in: categoryIds };
  } else if (req.query.category) {
    query.category = req.query.category;
  }

  if (req.query.status && req.query.status !== 'all') {
    query.status = req.query.status;
  }

  if (req.query.approvalStatus && req.query.approvalStatus !== 'all') {
    query.approvalStatus = req.query.approvalStatus;
  }

  if (req.query.organizer) {
    query.organizer = req.query.organizer;
  }

  if (req.query.from || req.query.to) {
    query.date = {};
    
    if (req.query.from) {
      query.date.$gte = new Date(req.query.from);
    }
    
    if (req.query.to) {
      query.date.$lte = new Date(req.query.to);
    }
  }

  let sortOption = {};

  switch (req.query.sort) {
    case 'date_asc':
      sortOption = { date: 1 };
      break;
    case 'date_desc':
      sortOption = { date: -1 };
      break;
    case 'title_asc':
      sortOption = { title: 1 };
      break;
    case 'title_desc':
      sortOption = { title: -1 };
      break;
    case 'recent':
      sortOption = { createdAt: -1 };
      break;
    default:
      sortOption = { createdAt: -1 }; // Padrão: relatos mais recentes primeiro
  }

  const counts = {
    total: await Report.countDocuments({}),
    active: await Report.countDocuments({ status: 'active' }),
    inactive: await Report.countDocuments({ status: 'inactive' }),
    canceled: await Report.countDocuments({ status: 'canceled' }),
    finished: await Report.countDocuments({ status: 'finished' }),
    pending: await Report.countDocuments({ approvalStatus: 'pending' }),
    approved: await Report.countDocuments({ approvalStatus: 'approved' }),
    rejected: await Report.countDocuments({ approvalStatus: 'rejected' })
  };

  const total = await Report.countDocuments(query);
  
  const reports = await Report.find(query)
    .populate('category', 'name')
    .populate('organizer', 'name email')
    .sort(sortOption)
    .skip(startIndex)
    .limit(limit);
  
  res.json({
    reports,
    page,
    pages: Math.ceil(total / limit),
    total,
    counts
  });
});

const activateReport = asyncHandler(async (req, res) => {
  const report = await Report.findById(req.params.id);

  if (!report) {
    throw new ErrorResponse('Relato não encontrado', 404);
  }

  if (req.user.role !== 'admin') {
    throw new ErrorResponse('Não autorizado', 403);
  }

  if (report.status === 'active') {
    throw new ErrorResponse('Relato já está ativo', 400);
  }

  if (report.approvalStatus !== 'approved') {
    throw new ErrorResponse('Apenas relatos aprovados podem ser ativados', 400);
  }

  if (report.status === 'canceled') {
    throw new ErrorResponse('Relatos cancelados não podem ser ativados', 400);
  }

  report.status = 'active';
  await report.save();

  res.json({
    _id: report._id,
    status: report.status,
    approvalStatus: report.approvalStatus
  });
});

const deactivateReport = asyncHandler(async (req, res) => {
  const report = await Report.findById(req.params.id);

  if (!report) {
    throw new ErrorResponse('Relato não encontrado', 404);
  }

  if (req.user.role !== 'admin') {
    throw new ErrorResponse('Não autorizado', 403);
  }

  if (report.status === 'inactive') {
    throw new ErrorResponse('Relato já está inativo', 400);
  }

  if (report.status === 'canceled') {
    throw new ErrorResponse('Relatos cancelados não podem ser inativados', 400);
  }

  report.status = 'inactive';
  await report.save();

  res.json({
    _id: report._id,
    status: report.status,
    approvalStatus: report.approvalStatus
  });
});

module.exports = {
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
};