import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { requireAuth, requireVerifiedEmail, requireApproved } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { sendMessageNotification } from '../lib/email.js';

const router = Router();

const messageSchema = z.object({
  rfqId: z.string().uuid(),
  recipientId: z.string().uuid(),
  subject: z.string().optional().nullable(),
  messageBody: z.string().min(1),
  attachments: z.array(z.string()).optional(),
});

// POST /api/messages - send a message inside an RFQ thread
router.post('/', requireAuth, requireApproved, requireVerifiedEmail, validate(messageSchema), async (req, res, next) => {
  try {
    const { rfqId, recipientId, subject, messageBody, attachments } = req.body;
    const rfq = await prisma.rfq.findUnique({
      where: { id: rfqId },
      include: { supplier: { select: { id: true, userId: true } } },
    });
    if (!rfq) return res.status(404).json({ error: 'RFQ not found' });

    const isBuyer = rfq.buyerId === req.user.id;
    const isSupplier = req.user.role === 'supplier';
    if (!isBuyer && !isSupplier && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'You are not a participant in this RFQ' });
    }

    const message = await prisma.message.create({
      data: {
        rfqId,
        senderId: req.user.id,
        recipientId,
        subject: subject || null,
        messageBody,
        attachments: attachments || [],
      },
      include: {
        sender: { select: { id: true, fullName: true, role: true } },
        recipient: { select: { id: true, fullName: true, role: true, email: true } },
      },
    });

    // First supplier response moves the RFQ to "Responded"; a supplier
    // answering a broadcast RFQ claims it for their profile.
    if (isSupplier) {
      const profile = await prisma.supplierProfile.findUnique({ where: { userId: req.user.id } });
      const data = {};
      if (rfq.status === 'Sent') data.status = 'Responded';
      if (!rfq.supplierId && profile) data.supplierId = profile.id;
      if (Object.keys(data).length) {
        await prisma.rfq.update({ where: { id: rfq.id }, data });
      }
    }

    await sendMessageNotification(message.recipient, req.user, rfq);
    res.status(201).json({ message });
  } catch (err) {
    next(err);
  }
});

// GET /api/messages/conversations - conversation list grouped by RFQ
router.get('/conversations', requireAuth, requireApproved, async (req, res, next) => {
  try {
    const messages = await prisma.message.findMany({
      where: { OR: [{ senderId: req.user.id }, { recipientId: req.user.id }] },
      orderBy: { createdAt: 'desc' },
      include: {
        rfq: { select: { id: true, title: true, status: true, productCategory: true } },
        sender: { select: { id: true, fullName: true, role: true } },
        recipient: { select: { id: true, fullName: true, role: true } },
      },
    });

    const byRfq = new Map();
    for (const m of messages) {
      if (!byRfq.has(m.rfqId)) {
        byRfq.set(m.rfqId, { rfq: m.rfq, lastMessage: m, unreadCount: 0, counterpart: null });
      }
      const conv = byRfq.get(m.rfqId);
      if (m.recipientId === req.user.id && m.status === 'Sent') conv.unreadCount += 1;
      if (!conv.counterpart) {
        conv.counterpart = m.senderId === req.user.id ? m.recipient : m.sender;
      }
    }
    res.json({ conversations: [...byRfq.values()] });
  } catch (err) {
    next(err);
  }
});

// GET /api/messages/:rfqId - full thread for an RFQ (marks incoming as read)
router.get('/:rfqId', requireAuth, requireApproved, async (req, res, next) => {
  try {
    const participantCount = await prisma.message.count({
      where: {
        rfqId: req.params.rfqId,
        OR: [{ senderId: req.user.id }, { recipientId: req.user.id }],
      },
    });
    if (req.user.role !== 'admin') {
      const totalCount = await prisma.message.count({ where: { rfqId: req.params.rfqId } });
      if (totalCount > 0 && participantCount === 0) {
        return res.status(403).json({ error: 'You are not a participant in this conversation' });
      }
    }
    await prisma.message.updateMany({
      where: { rfqId: req.params.rfqId, recipientId: req.user.id, status: 'Sent' },
      data: { status: 'Read', readAt: new Date() },
    });
    const messages = await prisma.message.findMany({
      where: { rfqId: req.params.rfqId },
      orderBy: { createdAt: 'asc' },
      include: {
        sender: { select: { id: true, fullName: true, role: true } },
        recipient: { select: { id: true, fullName: true, role: true } },
      },
    });
    res.json({ messages });
  } catch (err) {
    next(err);
  }
});

// PUT /api/messages/:messageId/read
router.put('/:messageId/read', requireAuth, requireApproved, async (req, res, next) => {
  try {
    const msg = await prisma.message.findUnique({ where: { id: req.params.messageId } });
    if (!msg) return res.status(404).json({ error: 'Message not found' });
    if (msg.recipientId !== req.user.id) {
      return res.status(403).json({ error: 'Only the recipient can mark a message as read' });
    }
    const message = await prisma.message.update({
      where: { id: msg.id },
      data: { status: 'Read', readAt: new Date() },
    });
    res.json({ message });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/messages/:messageId - sender only
router.delete('/:messageId', requireAuth, requireApproved, async (req, res, next) => {
  try {
    const msg = await prisma.message.findUnique({ where: { id: req.params.messageId } });
    if (!msg) return res.status(404).json({ error: 'Message not found' });
    if (msg.senderId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Only the sender can delete a message' });
    }
    await prisma.message.delete({ where: { id: msg.id } });
    res.json({ message: 'Message deleted' });
  } catch (err) {
    next(err);
  }
});

export default router;
