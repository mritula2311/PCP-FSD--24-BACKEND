import mongoose from 'mongoose';

const ticketSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'],
    default: 'OPEN'
  },
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  assignedAgentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  isReassigned: {
    type: Boolean,
    default: false
  },
  requiredSkills: {
    type: [String],
    default: []
  },
  commentsCount: {
    type: Number,
    default: 0
  },
  attachmentsCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

ticketSchema.index({ customerId: 1, createdAt: -1 });
ticketSchema.index({ assignedAgentId: 1, createdAt: -1 });
ticketSchema.index({ status: 1, createdAt: -1 });
ticketSchema.index({ title: 'text', description: 'text' });

const Ticket = mongoose.model('Ticket', ticketSchema);
export default Ticket;
