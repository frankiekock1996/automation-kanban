// pages/api/subtasks/[uuid].ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@/lib/db';
import { validate } from 'uuid';
import { getAuth } from '@clerk/nextjs/server';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { userId } = getAuth(req);

  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const subtaskUUID = req.query.uuid?.toString();
  if (!subtaskUUID || !validate(subtaskUUID)) {
    return res.status(400).json({ error: 'Invalid subtask UUID' });
  }

  try {
    switch (req.method) {
      case 'PUT': {
        const { name, completed } = req.body;
        
        // Verify subtask ownership through board relationship
        const existingSubtask = await db.subtask.findFirst({
          where: {
            uuid: subtaskUUID,
            task: {
              column: {
                board: {
                  clerkId: userId
                }
              }
            }
          }
        });

        if (!existingSubtask) {
          return res.status(404).json({ error: 'Subtask not found' });
        }

        const updatedSubtask = await db.subtask.update({
          where: { uuid: subtaskUUID },
          data: {
            ...(name !== undefined && { name }),
            ...(completed !== undefined && { completed })
          }
        });

        return res.status(200).json(updatedSubtask);
      }
      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}