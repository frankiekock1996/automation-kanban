import { db } from '@/lib/db'
import { Board, Column, Task } from '@prisma/client'

export type BoardWithColumns = Board & {
  columns: Column[]
}

export type BoardWithColumnsAndTasks = Board & {
  columns: (Column & {
    tasks: Task[]
  })[]
}
// src/lib/kanban.ts
export async function getBoard(
  boardId: string,
  clerkId: string // Changed from userId to clerkId
): Promise<BoardWithColumnsAndTasks | null> {
  if (!clerkId) {
    console.log('⚠️ getBoard called without clerkId');
    return null;
  }

  console.log('🔍 Querying board with UUID:', boardId, 'for user:', clerkId);

  const board = await db.board.findUnique({
    where: {
      uuid: boardId,
      clerkId: clerkId // Changed to match schema field name
    },
    include: {
      columns: {
        include: {
          tasks: {
            orderBy: { position: 'asc' },
          },
        },
        orderBy: { position: 'asc' },
      },
    },
  });

  if (!board) {
    console.log('❌ No board found for UUID:', boardId);
    return null;
  }

  return board as BoardWithColumnsAndTasks;
}