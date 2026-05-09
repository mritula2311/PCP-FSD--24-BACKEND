import mongoose from 'mongoose';

const attachmentSchema = new mongoose.Schema({
  ticketId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Ticket',
    required: true,
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  filename: {
    type: String,
    required: true,
  },
  mimeType: {
    type: String,
    default: 'application/octet-stream',
  },
  size: {
    type: Number,
    default: 0,
  },
  content: {
    type: Buffer,
    default: null,
  },
  uploaded: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});

attachmentSchema.index({ ticketId: 1, createdAt: -1 });

const Attachment = mongoose.model('Attachment', attachmentSchema);
export default Attachment;