import { NextApiRequest, NextApiResponse } from "next";
import { db } from "@/lib/db";
import { v4 as uuidv4 } from "uuid";
import { currentUser } from "@clerk/nextjs/server";

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
  userId: string;
};

const validateBoard = (board: Board) => {
  if (!board.name) throw new Error("Board name is required");
  if (board.name.trim().length < 1) throw new Error("Board name cannot be empty");
  if (board.name.trim().length > 30) throw new Error("Board name cannot be longer than 30 characters");
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const user = await currentUser();
  if (!user || !user.id) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  switch (req.method) {
    case "POST":
      return await createBoard(req, res, user.id);
    case "GET":
      return await getBoards(res, user.id);
    default:
      res.status(405).json({ error: "Method not allowed" });
  }
}

const getBoards = async (res: NextApiResponse, userId: string) => {
  try {
    const boards = await db.board.findMany({
      where: {
        user: {
          id: userId // ✅ use relation filtering
        }
      },
      include: {
        columns: true
      }
    });
    res.status(200).json(boards);
  } catch (error) {
    res.status(500).json({ error });
  }
};

const createBoard = async (req: NextApiRequest, res: NextApiResponse, userId: string) => {
  const boardData: {
    name: string;
    columns: { name: string; color: string }[];
  } = req.body;

  const board: Board = {
    name: boardData.name,
    uuid: uuidv4(),
    userId
  };

  if (boardData.columns) {
    const nameSet = new Set();
    for (const col of boardData.columns) {
      if (nameSet.has(col.name)) {
        return res.status(400).json({ error: "Column names must be unique" });
      }
      nameSet.add(col.name);
    }

    board.columns = boardData.columns.map((col, index) => ({
      name: col.name,
      color: col.color,
      position: index,
      userId,
      uuid: uuidv4()
    }));
  }

  try {
    validateBoard(board);
  } catch (error: any) {
    return res.status(400).json({ error: error.message });
  }

  try {
    const createdBoard = await db.board.create({
      data: {
        name: board.name,
        uuid: board.uuid,
        user: {
          connect: { id: board.userId }
        },
        columns: board.columns
          ? {
              create: board.columns
            }
          : undefined
      },
      include: {
        columns: true
      }
    });

    res.status(201).json(createdBoard);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to create board" });
  }
};
