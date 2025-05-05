import { db } from "@/lib/db";
import { validate } from "uuid";
import { v4 as uuidv4 } from "uuid";
import { randomHexColor } from "@/utils/utils";
import { auth } from "@clerk/nextjs/server";
import { NextResponse, NextRequest } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: { uuid: string } }
) {
  const { userId } = auth();
  if (!userId) return NextResponse.json("Unauthorized", { status: 401 });

  const uuid = params.uuid;
  if (!validate(uuid)) return NextResponse.json("Invalid UUID", { status: 400 });

  try {
    const board = await db.board.findFirst({
      where: {
        uuid,
        clerkId: userId,
      },
      include: {
        columns: {
          include: {
            tasks: {
              include: {
                subtasks: {
                  orderBy: { id: "asc" },
                },
              },
              orderBy: { position: "asc" },
            },
          },
          orderBy: { position: "asc" },
        },
      },
    });

    return board
      ? NextResponse.json(board)
      : NextResponse.json("Board not found", { status: 404 });
  } catch (e) {
    console.error(e);
    return NextResponse.json("Internal server error", { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { uuid: string } }
) {
  const { userId } = auth();
  if (!userId) return NextResponse.json("Unauthorized", { status: 401 });

  const uuid = params.uuid;
  if (!validate(uuid)) return NextResponse.json("Invalid UUID", { status: 400 });

  try {
    const boardData = await req.json();

    const currentBoard = await db.board.findFirst({
      where: {
        uuid,
        clerkId: userId,
      },
      include: {
        columns: true,
      },
    });

    if (!currentBoard) return NextResponse.json("Board not found", { status: 404 });

    // Ensure unique column names
    const columns = boardData.columns || [];
    const columnNames = new Set<string>();
    for (const col of columns) {
      if (columnNames.has(col.name)) {
        return NextResponse.json("Column names must be unique", { status: 400 });
      }
      columnNames.add(col.name);
    }

    await db.$transaction(async (tx) => {
      // Update board name
      if (boardData.name !== currentBoard.name) {
        await tx.board.updateMany({
          where: { uuid, clerkId: userId },
          data: { name: boardData.name },
        });
      }

      // Delete removed columns
      const currentColumnUUIDs = currentBoard.columns.map((col) => col.uuid);
      const incomingColumnUUIDs = columns.map((col: { uuid: any; }) => col.uuid).filter(Boolean);
      const columnsToDelete = currentColumnUUIDs.filter(
        (id) => !incomingColumnUUIDs.includes(id)
      );

      if (columnsToDelete.length > 0) {
        await tx.column.deleteMany({
          where: { uuid: { in: columnsToDelete } },
        });
      }

      // Upsert columns
      for (const col of columns) {
        await tx.column.upsert({
          where: {
            uuid: col.uuid || "", // If empty, will trigger create
          },
          create: {
            uuid: col.uuid || uuidv4(),
            name: col.name,
            position: col.position,
            color: col.color || randomHexColor(),
            board_uuid: uuid,
            clerkId: userId,
          },
          update: {
            name: col.name,
            position: col.position,
            color: col.color || randomHexColor(),
          },
        });
      }
    });

    return NextResponse.json("Board updated successfully");
  } catch (e) {
    console.error(e);
    return NextResponse.json("Internal server error", { status: 500 });
  }
}
