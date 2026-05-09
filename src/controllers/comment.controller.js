import Comment from '../models/Comment.js';
import Ticket from '../models/Ticket.js';

export const addTicketComment = async (req, res) => {
  try {
    const { message } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ message: 'Comment message is required' });
    }

    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    const comment = await Comment.create({
      ticketId: ticket._id,
      authorId: req.user._id,
      authorRole: req.user.role,
      message: message.trim(),
    });

    ticket.commentsCount = (ticket.commentsCount || 0) + 1;
    await ticket.save();

    res.status(201).json(comment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getTicketComments = async (req, res) => {
  try {
    const comments = await Comment.find({ ticketId: req.params.id })
      .populate('authorId', 'name email role')
      .sort({ createdAt: 1 });

    res.json(comments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};