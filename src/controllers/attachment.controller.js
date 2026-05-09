import Attachment from '../models/Attachment.js';
import Ticket from '../models/Ticket.js';

const getAttachmentUrl = (attachmentId, action) => `/api/tickets/attachments/${action}/${attachmentId}`;

export const createAttachmentUploadUrl = async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    const { filename, mimeType } = req.body;
    if (!filename) {
      return res.status(400).json({ message: 'filename is required' });
    }

    const attachment = await Attachment.create({
      ticketId: ticket._id,
      uploadedBy: req.user._id,
      filename,
      mimeType: mimeType || 'application/octet-stream',
    });

    res.status(201).json({
      attachmentId: attachment._id,
      uploadUrl: getAttachmentUrl(attachment._id, 'upload'),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const uploadAttachmentBinary = async (req, res) => {
  try {
    const attachment = await Attachment.findById(req.params.attachmentId);
    if (!attachment) {
      return res.status(404).json({ message: 'Attachment not found' });
    }

    attachment.content = Buffer.isBuffer(req.body) ? req.body : Buffer.from(req.body || []);
    attachment.size = attachment.content.length;
    attachment.mimeType = req.headers['content-type'] || attachment.mimeType;
    attachment.uploaded = true;
    await attachment.save();

    const ticket = await Ticket.findById(attachment.ticketId);
    if (ticket) {
      ticket.attachmentsCount = (ticket.attachmentsCount || 0) + 1;
      await ticket.save();
    }

    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createAttachmentDownloadUrl = async (req, res) => {
  try {
    const attachment = await Attachment.findById(req.params.attachmentId);
    if (!attachment) {
      return res.status(404).json({ message: 'Attachment not found' });
    }

    res.json({
      downloadUrl: getAttachmentUrl(attachment._id, 'download'),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const listTicketAttachments = async (req, res) => {
  try {
    const attachments = await Attachment.find({ ticketId: req.params.id })
      .select('_id ticketId filename mimeType size uploaded createdAt updatedAt')
      .sort({ createdAt: -1 });

    res.json(attachments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const downloadAttachment = async (req, res) => {
  try {
    const attachment = await Attachment.findById(req.params.attachmentId);
    if (!attachment || !attachment.uploaded || !attachment.content) {
      return res.status(404).json({ message: 'Attachment not found' });
    }

    res.setHeader('Content-Type', attachment.mimeType || 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename="${attachment.filename}"`);
    res.send(attachment.content);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};