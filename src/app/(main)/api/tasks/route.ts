import { db } from "@/lib/db";
import { v4 as uuidv4 } from "uuid";
import { currentUser } from "@clerk/nextjs/server";
import { NextResponse, NextRequest } from "next/server";

type BoardInput = {
  name: string;
  columns: { name: string; color: string }[];
};

// GET all boards for current user
export async function GET() {
  const user = await currentUser();
  if (!user) return NextResponse.json("Unauthorized", { status: 401 });

  try {
    const boards = await db.board.findMany({
      where: { user: { id: user.id } },
      include: { columns: true }
    });

    return NextResponse.json(boards, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error }, { status: 500 });
  }
}

// POST create new board with columns
export async function POST(req: NextRequest) {
  const user = await currentUser();
  if (!user) return NextResponse.json("Unauthorized", { status: 401 });

  const data: BoardInput = await req.json();

  if (!data.name || data.name.trim().length < 1 || data.name.trim().length > 30) {
    return NextResponse.json({ error: "Invalid board name" }, { status: 400 });
  }

  const nameSet = new Set();
  if (data.columns.some(col => nameSet.size === (nameSet.add(col.name), nameSet.size))) {
    return NextResponse.json({ error: "Column names must be unique" }, { status: 400 });
  }

  const boardId = uuidv4();
  const columns = data.columns.map((column, i) => ({
    name: column.name,
    color: column.color,
    position: i,
    userId: user.id,
    uuid: uuidv4()
  }));

  try {
    const newBoard = await db.board.create({
      data: {
        name: data.name,
        uuid: boardId,
        user: { connect: { id: user.id } },
        columns: {
          createMany: { data: columns }
        }
      }
    });

    return NextResponse.json(newBoard, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error }, { status: 500 });
  }
}
