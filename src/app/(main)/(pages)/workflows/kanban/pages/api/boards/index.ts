// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../utils/db';
import { v4 as uuidv4 } from 'uuid';
import { getSession } from 'next-auth/react';
import {  useAuth } from '@clerk/nextjs';
import { auth } from '@clerk/nextjs/server'

type Board = {
    name: string;
    columns?: Column[];
    uuid: string;
    userId: string;
};

type Column = {
    name: string;
    color: string;
    position: number;
    uuid: string;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { userId } = auth(); // Clerk's `auth` method to get the authenticated user
    if (!userId) {
        return res.status(401).end('Unauthorized');
    }

    switch (req.method) {
        case 'POST': {
            return await createBoard(req, res, userId);
        }
        case 'GET': {
            return await getBoards(res, userId);
        }
        default:
            return res.status(405).end('Method not allowed');
    }
}

const validateBoard = (board: Board) => {
    if (!board.name) {
        throw new Error('Board name is required');
    } else if (board.name.trim().length < 1) {
        throw new Error('Board name cannot be empty');
    } else if (board.name.trim().length > 30) {
        throw new Error('Board name cannot be longer than 30 characters');
    }
};

const getBoards = async (res: NextApiResponse, userId: string) => {
    try {
        const boards = await prisma.board.findMany({
            where: {
                userId, // Filter by the authenticated user's ID
            },
            include: {
                columns: true,
            },
        });
        res.status(200).json(boards);
    } catch (error) {
        res.status(500).json({ error });
    }
};

const createBoard = async (req: NextApiRequest, res: NextApiResponse, userId: string) => {
    const boardData: { name: string; columns: { name: string; color: string }[] } = req.body;
    const board: Board = {
        name: boardData.name,
        uuid: uuidv4(),
        userId,
    };

    if (boardData.columns) {
        const set = new Set();
        if (boardData.columns.some((col) => set.size === (set.add(col.name), set.size))) {
            return res.status(400).json({ error: 'Column names must be unique' });
        }
        board.columns = boardData.columns.map((column, i) => {
            return {
                name: column.name,
                color: column.color,
                position: i,
                uuid: uuidv4(),
            };
        });
    }

    try {
        validateBoard(board);
    } catch (error: any) {
        return res.status(400).json({ error: error.message });
    }

    const payload = {
        data: {
            name: board.name,
            uuid: board.uuid,
            userId, // Associate the board with the authenticated user
            columns: board.columns
                ? {
                      createMany: {
                          data: board.columns,
                      },
                  }
                : undefined,
        },
    };

    try {
        const newBoard = await prisma.board.create(payload);
        res.status(201).json(newBoard);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error });
    }
};