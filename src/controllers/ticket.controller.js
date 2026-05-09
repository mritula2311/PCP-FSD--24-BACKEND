import Ticket from '../models/Ticket.js';
import Reassignment from '../models/Reassignment.js';
import User from '../models/User.js';
import { pickBestAgentForTicket } from '../utils/auto-assignment.utils.js';

// @desc    Create new ticket
// @route   POST /api/tickets
// @access  Private/Customer
export const createTicket = async (req, res) => {
  try {
    const { title, description, requiredSkills = [] } = req.body;

    if (!title || !description) {
      return res.status(400).json({ message: 'Please provide title and description' });
    }

    const agents = await User.find({ role: 'AGENT' }).select('_id name skillTags');
    const agentsWithLoad = await Promise.all(
      agents.map(async (agent) => ({
        ...agent.toObject(),
        ticketLoad: await Ticket.countDocuments({ assignedAgentId: agent._id }),
      }))
    );
    const selectedAgent = await pickBestAgentForTicket({ agents: agentsWithLoad, requiredSkills });

    const ticket = new Ticket({
      title,
      description,
      status: 'OPEN',
      customerId: req.user._id,
      assignedAgentId: selectedAgent?._id || null,
      requiredSkills,
    });

    const createdTicket = await ticket.save();

    const populatedTicket = await Ticket.findById(createdTicket._id)
      .populate('customerId', 'name email')
      .populate('assignedAgentId', 'name email');

    res.status(201).json(populatedTicket);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get logged in user tickets
// @route   GET /api/tickets/my
// @access  Private/Customer
export const getMyTickets = async (req, res) => {
  try {
    const tickets = await Ticket.find({ customerId: req.user._id }).populate('assignedAgentId', 'name email');
    res.json(tickets);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get assigned tickets for agent
// @route   GET /api/tickets
// @access  Private/Agent
export const getAssignedTickets = async (req, res) => {
  try {
    const tickets = await Ticket.find({ assignedAgentId: req.user._id }).populate('customerId', 'name email');
    res.json(tickets);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all tickets
// @route   GET /api/tickets/all
// @access  Private/Agent
export const getAllTickets = async (req, res) => {
  try {
    const tickets = await Ticket.find({}).populate('customerId', 'name email').populate('assignedAgentId', 'name email');
    res.json(tickets);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update ticket status
// @route   PATCH /api/tickets/:id/status
// @access  Private/Agent
export const updateTicketStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }

    const ticket = await Ticket.findById(req.params.id);

    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    if (!ticket.assignedAgentId || ticket.assignedAgentId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only the assigned agent can update this ticket status' });
    }

    ticket.status = status;
    const updatedTicket = await ticket.save();

    res.json(updatedTicket);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Reassign ticket to another agent
// @route   PATCH /api/tickets/:id/reassign
// @access  Private/Agent
export const reassignTicket = async (req, res) => {
  try {
    const { toAgentId } = req.body;

    if (!toAgentId) {
      return res.status(400).json({ message: 'toAgentId is required' });
    }
    
    // 1. Find ticket by ID
    const ticket = await Ticket.findById(req.params.id);

    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    if (ticket.assignedAgentId && ticket.assignedAgentId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only the assigned agent can reassign this ticket' });
    }

    // 2. Check ticket.isReassigned === true → reject (ONE TIME REASSIGNMENT RULE)
    if (ticket.isReassigned) {
      return res.status(400).json({ 
        message: 'This ticket has already been reassigned and cannot be reassigned again.' 
      });
    }

    // 3. Verify toAgentId exists and has role AGENT
    const targetAgent = await User.findById(toAgentId);
    if (!targetAgent || targetAgent.role !== 'AGENT') {
      return res.status(400).json({ message: 'Invalid target agent provided' });
    }
    
    if (ticket.assignedAgentId && ticket.assignedAgentId.toString() === toAgentId) {
       return res.status(400).json({ message: 'Agent is already assigned to this ticket' });
    }

    const fromAgentId = ticket.assignedAgentId || req.user._id;

    // 4. Update ticket: assignedAgentId = toAgentId, isReassigned = true
    ticket.assignedAgentId = toAgentId;
    ticket.isReassigned = true;
    const updatedTicket = await ticket.save();

    // 5. Insert into Reassignments table
    await Reassignment.create({
      ticketId: ticket._id,
      fromAgentId: fromAgentId,
      toAgentId: toAgentId
    });

    // 6. Return updated ticket
    res.json(updatedTicket);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
