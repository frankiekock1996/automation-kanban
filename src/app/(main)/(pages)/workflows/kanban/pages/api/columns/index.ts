// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../utils/db';
import { v4 as uuidv4, validate } from 'uuid';
import { NewColumn } from '@/types';
import { auth } from '@clerk/nextjs/server';

const isNewColumn = (column: unknown): column is NewColumn => {
    return (
        typeof column === 'object' && column !== null && 'board_uuid' in column && 'name' in column && 'color' in column
    );
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    // Use Clerk's auth to retrieve the authenticated user's ID
    const { userId:clerkId } = auth();

    if (!clerkId) {
        return res.status(401).end('Unauthorized');
    }

    switch (req.method) {
        case 'POST': {
            return await createColumn(req, res, clerkId);
        }
        case 'GET': {
            return await getColumns(res, clerkId);
        }
        default:
            res.status(405).end('Method not allowed');
            break;
    }
}

const getColumns = async (res: NextApiResponse, clerkId: string) => {
    try {
        const columns = await prisma.column.findMany({
            where: {
                board: {
                    clerkId, // Ensure filtering through the related Board
                },
            },
        });
        res.status(200).json(columns);
    } catch (error) {
        res.status(500).json({ error });
    }
};

const createColumn = async (req: NextApiRequest, res: NextApiResponse, clerkId: string) => {
    const columnData: unknown = req.body;
    if (!isNewColumn(columnData)) {
        return res.status(400).json({ error: 'Invalid column data' });
    }
    if (!columnData.board_uuid || !validate(columnData.board_uuid)) {
        return res.status(400).json({ error: 'Invalid board UUID' });
    }
    if (columnData.name.length < 1 || columnData.name.length > 20) {
        return res.status(400).json({ error: 'Column name must be between 1 and 20 characters' });
    }
    const boardData = await prisma.board.findFirst({
        where: {
            uuid: columnData.board_uuid,
            clerkId // Ensures user owns the board
        },
        include: {
            columns: true
        }
    });
    if (!boardData) {
        return res.status(404).json({ error: 'Board not found' });
    }
    if (boardData.columns.find((column) => column.name.toLowerCase() === columnData.name.toLowerCase())) {
        return res.status(400).json({ error: 'Column with this name already exists on this board' });
    }
    const positionSet = columnData.position !== undefined;
    columnData.position = columnData.position ?? boardData.columns.length;
    try {
        const response = await prisma.$transaction(async (tx) => {
            if (positionSet) {
                await tx.column.updateMany({
                    where: {
                        board_uuid: columnData.board_uuid,
                        position: {
                            gte: columnData.position,
                        },
                    },
                    data: {
                        position: {
                            increment: 1,
                        },
                    },
                });
            }
            return await tx.column.create({
                data: {
                    name: columnData.name,
                    color: columnData.color,
                    position: columnData.position as number,
                    uuid: uuidv4(),
                    
                    board: {
                        connect: {
                            uuid: columnData.board_uuid,
                        },
                    },
                },
            });
        });
        return res.status(200).json(response);
    } catch (err) {
        return res.status(500).json('Error creating column');
    }
};
