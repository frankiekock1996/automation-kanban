import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

type UpdatedColumnData = {
  name?: string;
  color?: string;
  position?: number;
};

const decrementHigherPositions = (boardUUID: string, position: number) => {
  return db.column.updateMany({
    where: {
      board_uuid: boardUUID,
      position: { gt: position }
    },
    data: {
      position: { decrement: 1 }
    }
  });
};

const incrementFromPosition = (boardUUID: string, position: number) => {
  return db.column.updateMany({
    where: {
      board_uuid: boardUUID,
      position: { gte: position }
    },
    data: {
      position: { increment: 1 }
    }
  });
};

export async function PUT(req: Request, { params }: { params: { uuid: string } }) {
  const { userId } = auth();
  if (!userId) return NextResponse.json("Unauthorized", { status: 401 });

  const columnUUID = params.uuid;
  const columnData: UpdatedColumnData = await req.json();

  const currentColumnData = await db.column.findFirst({
    where: {
      uuid: columnUUID,
      clerkId: userId
    }
  });

  if (!currentColumnData) {
    return NextResponse.json("Column not found", { status: 404 });
  }

  const { name, color, position } = columnData;
  const payload = {
    name: name ?? currentColumnData.name,
    color: color ?? currentColumnData.color,
    position: position ?? currentColumnData.position
  };

  try {
    const response = await db.$transaction(async (tx) => {
      if (position !== undefined && position !== currentColumnData.position) {
        await decrementHigherPositions(currentColumnData.board_uuid, currentColumnData.position);
        await incrementFromPosition(currentColumnData.board_uuid, position);
      }

      return await tx.column.update({
        where: { uuid: columnUUID },
        data: payload
      });
    });

    return NextResponse.json(response, { status: 200 });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json("Something went wrong", { status: 500 });
  }
}
