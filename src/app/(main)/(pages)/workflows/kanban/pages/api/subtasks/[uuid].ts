// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../utils/db';
import { validate } from 'uuid';
import { auth } from '@clerk/nextjs/server';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    // Use Clerk's auth to get the authenticated user
    const { userId } = auth();

    if (!userId) {
        return res.status(401).end('Unauthorized');
    }

    if (!req.query.uuid || !validate(req.query.uuid.toString())) {
        return res.status(400).end('Invalid subtask UUID');
    }

    switch (req.method) {
        case 'PUT': {
            return await updateSubtask(req, res, userId);
        }
        default:
            res.status(405).end('Method not allowed');
            break;
    }
}

const updateSubtask = async (req: NextApiRequest, res: NextApiResponse, userId: string) => {
    const subtaskUUID = req.query.uuid!.toString();

    // Find the subtask that matches the UUID and belongs to the authenticated user
    const currentSubtaskData = await prisma.subtask.findFirst({
        where: {
            uuid: subtaskUUID,
            clerkId: userId, // Use Clerk's userId to validate ownership
        },
    });

    if (!currentSubtaskData) {
        return res.status(404).end('Subtask not found');
    }

    const { name, completed } = req.body;

    if (typeof name === 'undefined' && typeof completed === 'undefined') {
        return res.status(400).end('No data to update');
    }

    const newSubtaskData = {
        name: typeof name === 'string' ? name : currentSubtaskData.name,
        completed: typeof completed === 'boolean' ? completed : currentSubtaskData.completed,
    };

    try {
        const response = await prisma.subtask.update({
            where: {
                uuid: subtaskUUID,
            },
            data: newSubtaskData,
        });
        return res.status(200).json(response);
    } catch (error: any) {
        console.error(error);
        return res.status(500).end('Something went wrong');
    }
};
