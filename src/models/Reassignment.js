import mongoose from 'mongoose';

const reassignmentSchema = new mongoose.Schema({
  ticketId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Ticket',
    required: true
  },
  fromAgentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  toAgentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  reassignedAt: {
    type: Date,
    default: Date.now
  }
});

const Reassignment = mongoose.model('Reassignment', reassignmentSchema);
export default Reassignment;
