import express from 'express';
import { 
  createTicket, 
  getMyTickets, 
  getAssignedTickets, 
  getAllTickets, 
  updateTicketStatus, 
  reassignTicket 
} from '../controllers/ticket.controller.js';
import {
  addTicketComment,
  getTicketComments,
} from '../controllers/comment.controller.js';
import {
  createAttachmentUploadUrl,
  uploadAttachmentBinary,
  createAttachmentDownloadUrl,
  listTicketAttachments,
  downloadAttachment,
} from '../controllers/attachment.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { requireRole } from '../middleware/role.middleware.js';

const router = express.Router();

router.post('/', protect, requireRole('CUSTOMER'), createTicket);
router.get('/my', protect, requireRole('CUSTOMER'), getMyTickets);

router.get('/', protect, requireRole('AGENT'), getAssignedTickets);
router.get('/all', protect, requireRole('AGENT'), getAllTickets);
router.patch('/:id/status', protect, requireRole('AGENT'), updateTicketStatus);
router.patch('/:id/reassign', protect, requireRole('AGENT'), reassignTicket);

router.post('/:id/comments', protect, requireRole('CUSTOMER', 'AGENT'), addTicketComment);
router.get('/:id/comments', protect, requireRole('CUSTOMER', 'AGENT'), getTicketComments);

router.post('/:id/attachments/sign-upload', protect, requireRole('CUSTOMER', 'AGENT'), createAttachmentUploadUrl);
router.get('/:id/attachments', protect, requireRole('CUSTOMER', 'AGENT'), listTicketAttachments);
router.post('/attachments/:attachmentId/sign-download', protect, requireRole('CUSTOMER', 'AGENT'), createAttachmentDownloadUrl);
router.put('/attachments/upload/:attachmentId', express.raw({ type: '*/*', limit: process.env.ATTACHMENT_UPLOAD_LIMIT || '10mb' }), uploadAttachmentBinary);
router.get('/attachments/download/:attachmentId', downloadAttachment);

export default router;
