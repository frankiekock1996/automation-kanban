// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../utils/db';
import { validate, v4 as uuidv4 } from 'uuid';
import { Subtask } from '@/types';
import { getAuth } from '@clerk/nextjs/server';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { userId: clerkId } = getAuth(req);
    if (!clerkId) {
        return res.status(401).end('Unauthorized');
    }

    const taskUUID = req.query.uuid?.toString();
    if (!taskUUID || !validate(taskUUID)) {
        return res.status(400).end('Invalid task UUID');
    }

    try {
        switch (req.method) {
            case 'DELETE':
                return await deleteTask(req, res, clerkId, taskUUID);
            case 'GET':
                return await getTask(res, clerkId, taskUUID);
            case 'PUT':
                return await updateTask(req, res, clerkId, taskUUID);
            default:
                return res.status(405).end('Method not allowed');
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}

const verifyTaskOwnership = async (taskUUID: string, clerkId: string) => {
    return prisma.task.findFirst({
        where: {
            uuid: taskUUID,
            column: {
                board: {
                    clerkId
                }
            }
        },
        include: {
            column: {
                include: {
                    board: true
                }
            },
            subtasks: true
        }
    });
};

const getTask = async (res: NextApiResponse, clerkId: string, taskUUID: string) => {
    const task = await verifyTaskOwnership(taskUUID, clerkId);
    if (!task) return res.status(404).end('Task not found');
    
    return res.status(200).json({
        ...task,
        subtasks: task.subtasks.sort((a, b) => a.id - b.id)
    });
};

const deleteTask = async (req: NextApiRequest, res: NextApiResponse, clerkId: string, taskUUID: string) => {
    const task = await verifyTaskOwnership(taskUUID, clerkId);
    if (!task) return res.status(404).end('Task not found');
  
    try {
      await prisma.$transaction(async (prisma) => {
        await prisma.task.delete({
          where: { uuid: taskUUID }
        });
        await prisma.task.updateMany({
          where: {
            column_uuid: task.column_uuid,
            position: { gt: task.position }
          },
          data: { position: { decrement: 1 } }
        });
      });
      return res.status(200).end('Task deleted');
    } catch (e) {
      console.error(e);
      return res.status(500).json({ error: 'Something went wrong' });
    }
  };

  const updateTask = async (
    req: NextApiRequest,
    res: NextApiResponse,
    clerkId: string,
    taskUUID: string
) => {
    const task = await verifyTaskOwnership(taskUUID, clerkId);
    if (!task) return res.status(404).end('Task not found');

    const { error, data } = validateTaskData(req.body, task);
    if (error || !data) return res.status(400).end(error || 'Invalid data');

    await prisma.$transaction(async (tx) => {
        if (data.positionChanged) {
            await decrementHigherPositions(tx, task.column_uuid, task.position);
        }

        if (data.newColumn || data.positionChanged) {
            await incrementFromPosition(
                tx,
                data.newColumn || task.column_uuid,
                data.position
            );
        }

        await updateTaskContents(tx, taskUUID, data);
    });

    return res.status(200).end('Task updated');
};
  
// Helper functions - Fix transaction handling
const decrementHigherPositions = async (tx: any, columnUUID: string, position: number) => {
    await tx.task.updateMany({
        where: {
            column_uuid: columnUUID,
            position: { gt: position }
        },
        data: { position: { decrement: 1 } }
    });
};

const incrementFromPosition = async (tx: any, columnUUID: string, position: number) => {
    await tx.task.updateMany({
        where: {
            column_uuid: columnUUID,
            position: { gte: position }
        },
        data: { position: { increment: 1 } }
    });
};

const validateTaskData = (body: any, existingTask: any) => {
    const { name, description, column_uuid, position, subtasks } = body;
    const errors = [];
    
    if (column_uuid && !validate(column_uuid)) errors.push('Invalid column UUID');
    if (position !== undefined && (typeof position !== 'number' || position < 0)) {
        errors.push('Invalid position value');
    }
    if (name && typeof name !== 'string') errors.push('Invalid name');
    if (description && typeof description !== 'string') errors.push('Invalid description');
    
    if (errors.length > 0) return { error: errors.join(', ') };

    return {
        data: {
            name: name || existingTask.name,
            description: description ?? existingTask.description,
            column_uuid: column_uuid || existingTask.column_uuid,
            position: position ?? existingTask.position,
            subtasks: subtasks || existingTask.subtasks,
            positionChanged: position !== undefined || column_uuid !== undefined,
            newColumn: column_uuid && column_uuid !== existingTask.column_uuid
        }
    };
};

const updateTaskContents = async (tx: any, taskUUID: string, data: any) => {
    const { subtasks, ...taskData } = data;
    const subtasksToDelete = await processSubtasks(tx, taskUUID, subtasks);

    await tx.task.update({
        where: { uuid: taskUUID },
        data: {
            ...taskData,
            subtasks: {
                deleteMany: { uuid: { in: subtasksToDelete } }
            }
        }
    });

    await upsertSubtasks(tx, taskUUID, subtasks);
};

const processSubtasks = async (tx: any, taskUUID: string, subtasks: Subtask[]) => {
    const existingSubtasks = await tx.subtask.findMany({
        where: { task_uuid: taskUUID }
    });

    return existingSubtasks
        .filter((es: Subtask) => !subtasks.some((s) => s.uuid === es.uuid))
        .map((es: Subtask) => es.uuid);
};

const upsertSubtasks = async (tx: any, taskUUID: string, subtasks: Subtask[]) => {
    for (const subtask of subtasks) {
        await tx.subtask.upsert({
            where: { uuid: subtask.uuid || '' },
            update: { name: subtask.name },
            create: {
                uuid: subtask.uuid || uuidv4(),
                name: subtask.name,
                task_uuid: taskUUID
            }
        });
    }
};

type OptionalTaskData = {
    name?: string;
    description?: string;
    column_uuid?: string;
    subtasks?: Subtask[];
    position?: number;
    positionChanged?: boolean;
    newColumn?: string;
};