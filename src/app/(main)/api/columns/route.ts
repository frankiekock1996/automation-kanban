import { db } from "@/lib/db";
import { v4 as uuidv4, validate } from "uuid";
import { NewColumn } from "@/types";
import { NextResponse } from "next/server";
// import { getAuth } from "@clerk/nextjs/server";
import { auth } from "@clerk/nextjs/server";



const isNewColumn = (column: unknown): column is NewColumn => {
  return (
    typeof column === "object" &&
    column !== null &&
    "board_uuid" in column &&
    "name" in column &&
    "color" in column
  );
};

export async function POST(req: Request) {
    const { userId } = auth(); // Clerk user ID
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const columnData: unknown = await req.json();

  if (!isNewColumn(columnData)) {
    return NextResponse.json({ error: "Invalid column data" }, { status: 400 });
  }

  if (!columnData.board_uuid || !validate(columnData.board_uuid)) {
    return NextResponse.json({ error: "Invalid board UUID" }, { status: 400 });
  }

  if (columnData.name.length < 1 || columnData.name.length > 20) {
    return NextResponse.json(
      { error: "Column name must be between 1 and 20 characters" },
      { status: 400 }
    );
  }

  const boardData = await db.board.findFirst({
    where: {
      uuid: columnData.board_uuid,
      clerkId: userId,
    },
    include: {
      columns: true, // Required to access board.columns
    },
  });

  if (!boardData) {
    return NextResponse.json({ error: "Board not found" }, { status: 404 });
  }

  const columnExists = boardData.columns.some(
    (col) => col.name.toLowerCase() === columnData.name.toLowerCase()
  );
  if (columnExists) {
    return NextResponse.json(
      { error: "Column with this name already exists on this board" },
      { status: 400 }
    );
  }

  const positionSet = columnData.position !== undefined;
  columnData.position = columnData.position ?? boardData.columns.length;

  try {
    const response = await db.$transaction(async (tx) => {
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
          position: columnData.position ?? 0,
          uuid: uuidv4(),
          clerkId: userId, // Use Clerk ID
          board: {
            connect: {
              uuid: columnData.board_uuid,
            },
          },
        },
      });
    });

    return NextResponse.json(response, { status: 200 });
  } catch (err) {
    console.error(err);
    return NextResponse.json("Error creating column", { status: 500 });
  }
}
