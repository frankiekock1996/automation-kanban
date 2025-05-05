import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';

const UpdateTaskSchema = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
  position: z.number().optional(),
  column_uuid: z.string().optional(),
});

export async function PATCH(req: NextRequest, { params }: { params: { uuid: string } }) {
  try {
    const { userId } = auth();
    if (!userId) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const validated = UpdateTaskSchema.parse(body);

    const task = await db.task.findUnique({
      where: { uuid: params.uuid },
      include: { column: { include: { board: true } } },
    });

    if (!task) return NextResponse.json({ message: 'Task not found' }, { status: 404 });
    if (task.column.board.clerkId !== userId)
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });

    const updatedTask = await db.task.update({
      where: { uuid: params.uuid },
      data: validated,
    });

    return NextResponse.json(updatedTask);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(_: NextRequest, { params }: { params: { uuid: string } }) {
  try {
    const { userId } = auth();
    if (!userId) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    const task = await db.task.findUnique({
      where: { uuid: params.uuid },
      include: { column: { include: { board: true } } },
    });

    if (!task) return NextResponse.json({ message: 'Task not found' }, { status: 404 });
    if (task.column.board.clerkId !== userId)
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });

    await db.task.delete({ where: { uuid: params.uuid } });

    return NextResponse.json({ message: 'Task deleted' });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
