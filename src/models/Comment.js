import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema({
  ticketId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Ticket',
    required: true,
  },
  authorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  authorRole: {
    type: String,
    enum: ['CUSTOMER', 'AGENT'],
    required: true,
  },
  message: {
    type: String,
    required: true,
    trim: true,
  },
}, {
  timestamps: true,
});

commentSchema.index({ ticketId: 1, createdAt: -1 });

const Comment = mongoose.model('Comment', commentSchema);
export default Comment;