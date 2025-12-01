const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  title: { 
    type: String, 
    required: [true, 'O título do relato é obrigatório'],
    trim: true,
    minlength: [3, 'O título deve ter no mínimo 3 caracteres'],
    maxlength: [100, 'O título deve ter no máximo 100 caracteres']
  },
  description: { 
    type: String, 
    required: [true, 'A descrição do relato é obrigatória'],
    trim: true,
    minlength: [10, 'A descrição deve ter no mínimo 10 caracteres']
  },
  imageUrl: {
    type: String,
    validate: {
      validator: function(v) {
        return !v || /^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/i.test(v);
      },
      message: props => `${props.value} não é uma URL válida!`
    },
    default: null
  },
  date: { 
    type: Date, 
    required: [true, 'A data do relato é obrigatória']
  },
  location: { 
    address: {
      type: String,
      required: [true, 'O endereço do relato é obrigatório'],
      trim: true
    },
    city: {
      type: String,
      required: [true, 'A cidade do relato é obrigatória'],
      trim: true
    },
    state: {
      type: String,
      required: [true, 'O estado do relato é obrigatório'],
      trim: true
    },
    country: {
      type: String,
      required: [true, 'O país do relato é obrigatório'],
      trim: true,
      default: 'Brasil'
    }
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: [true, 'A categoria do relato é obrigatória']
  },
  organizer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'O organizador do relato é obrigatório']
  },
  status: {
    type: String,
    enum: ['active', 'canceled', 'finished', 'inactive'],
    default: 'inactive'
  },
  approvalStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  approvalDate: {
    type: Date,
    default: null
  },
  rejectionReason: {
    type: String,
    default: null
  },
  tags: [{ type: String, trim: true }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

reportSchema.virtual('isApproved').get(function() {
  return this.approvalStatus === 'approved';
});

reportSchema.methods.approve = async function(adminId) {
  this.approvalStatus = 'approved';
  this.approvedBy = adminId;
  this.approvalDate = new Date();
  this.rejectionReason = null;
  this.status = 'active';
  return this.save();
};

reportSchema.methods.reject = async function(adminId, reason) {
  this.approvalStatus = 'rejected';
  this.approvedBy = adminId;
  this.approvalDate = new Date();
  this.rejectionReason = reason || null;
  this.status = 'inactive';
  return this.save();
};

reportSchema.pre('save', async function(next) {
  if (this.isNew) {
    const User = mongoose.model('User');
    const organizer = await User.findById(this.organizer);
    
    if (organizer && organizer.role === 'admin') {
      this.approvalStatus = 'approved';
      this.approvedBy = this.organizer;
      this.approvalDate = new Date();
      this.status = 'active';
    } else {

      this.status = 'inactive';
    }
  } else if (this.isModified('approvalStatus')) {

    if (this.approvalStatus === 'approved') {
      this.status = 'active';
    } else if (this.approvalStatus === 'rejected' || this.approvalStatus === 'pending') {
      this.status = 'inactive';
    }
  }
  next();
});

reportSchema.index({ date: 1 });
reportSchema.index({ category: 1 });
reportSchema.index({ status: 1 });
reportSchema.index({ approvalStatus: 1 });
reportSchema.index({ organizer: 1 });
reportSchema.index({ 'location.city': 1 });
reportSchema.index({ 'location.state': 1 });
reportSchema.index({ 'location.country': 1 });
reportSchema.index({ tags: 1 });
reportSchema.index({ title: 'text', description: 'text', 'location.address': 'text' });

module.exports = mongoose.model('Report', reportSchema);
