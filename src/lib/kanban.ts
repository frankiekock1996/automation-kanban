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
export async function getBoard(boardId: string, userId?: string | null): Promise<BoardWithColumnsAndTasks | null> {
  if (!userId) {
    console.log('⚠️ getBoard called without userId');
    return null;
  }

  console.log('🔍 Querying board with UUID:', boardId, 'for user:', userId);

  const board = await db.board.findUnique({
    where: {
      uuid: boardId, // ✅ Ensure we query using `uuid` (not `id`)
      userId,
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
  }

  return board;
}
  