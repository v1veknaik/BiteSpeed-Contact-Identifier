import express from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();
import { Request, Response } from 'express';

router.post('/identify', async (req: Request, res: Response) => {
  const { email, phoneNumber } = req.body;

  if (!email && !phoneNumber) {
    return res.status(400).json({ error: "Email or phoneNumber required" });
  }

  const matchedContacts = await prisma.contact.findMany({
    where: {
      OR: [
        { email: email || undefined },
        { phoneNumber: phoneNumber || undefined }
      ]
    },
    orderBy: { createdAt: 'asc' }
  });

  let allContacts: any[] = [...matchedContacts];

  // Discover related contacts recursively (avoid cycles)
  const getAllRelated = async (contacts: any[]) => {
    const ids = contacts.map(c => c.id);
    const linkedIds = contacts.filter(c => c.linkedId).map(c => c.linkedId);

    const newContacts = await prisma.contact.findMany({
      where: {
        OR: [
          { linkedId: { in: ids } },
          { id: { in: linkedIds } }
        ]
      }
    });

    const combined = [...contacts, ...newContacts];
    const unique = Array.from(new Map(combined.map(c => [c.id, c])).values());
    if (unique.length > contacts.length) {
      return getAllRelated(unique);
    }
    return unique;
  };

  allContacts = await getAllRelated(allContacts);

  let primary = allContacts.find(c => c.linkPrecedence === "primary") || allContacts[0];
  for (let c of allContacts) {
    if (c.createdAt < primary.createdAt) primary = c;
  }

  // Check if new info needs to be added
  const existingEmails = allContacts.map(c => c.email).filter(Boolean);
  const existingPhones = allContacts.map(c => c.phoneNumber).filter(Boolean);
  let newContactCreated = false;

  if ((email && !existingEmails.includes(email)) || (phoneNumber && !existingPhones.includes(phoneNumber))) {
    await prisma.contact.create({
      data: {
        email,
        phoneNumber,
        linkedId: primary.id,
        linkPrecedence: "secondary",
      }
    });
    newContactCreated = true;
    allContacts = await getAllRelated([...allContacts]);
  }

  // Normalize contacts again after possible insert
  const emails = [...new Set([primary.email, ...allContacts.map(c => c.email).filter(Boolean).filter(e => e !== primary.email)])];
  const phoneNumbers = [...new Set([primary.phoneNumber, ...allContacts.map(c => c.phoneNumber).filter(Boolean).filter(p => p !== primary.phoneNumber)])];
  const secondaryContactIds = allContacts.filter(c => c.linkPrecedence === "secondary").map(c => c.id);

  res.status(200).json({
    contact: {
      primaryContatctId: primary.id,
      emails,
      phoneNumbers,
      secondaryContactIds
    }
  });
});

export default router;