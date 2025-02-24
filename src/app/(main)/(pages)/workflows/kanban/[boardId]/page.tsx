import { auth } from '@clerk/nextjs/server';
import Head from 'next/head';
import { useEffect } from 'react';
import { mutate } from 'swr';
import Board from '../components/Board/Board';
import Layout from '../components/Layout/Layout';
import TaskDetails from '../components/Modals/TaskDetails';
import Spinner from '../components/Spinner/Spinner';
import useModal from '../hooks/useModal';
import { useBoardsContext } from '../store/BoardListContext';
import { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation'
import { getBoard } from '@/lib/kanban'

// ✅ Fix: Ensure boardId is correctly mapped to uuid
export async function generateMetadata({
  params,
}: {
  params: { boardId: string };
}): Promise<Metadata> {
  const { userId } = auth();
  if (!userId) return { title: 'Kanban Board' };

  console.log('🔍 Generating metadata for board:', params.boardId);

  const board = await getBoard(params.boardId, userId);
  return {
    title: board?.name ? `Kanban - ${board.name}` : 'Kanban Board',
    description: 'Task management web app',
  };
}

// ✅ Fix: Ensure user authentication and correct boardId usage
export default async function BoardPage({
  params,
}: {
  params: { boardId: string };
}) {
  const { userId } = auth();

  // Redirect if not authenticated
  if (!userId) {
    console.log('🚨 User not authenticated, redirecting to sign-in');
    redirect('/sign-in');
  }

  console.log('🔍 Fetching board with UUID:', params.boardId, 'for user:', userId);
  const board = await getBoard(params.boardId, userId);

  // Handle 404 if board is not found
  if (!board) {
    console.log('❌ Board not found, returning 404:', params.boardId);
    notFound();
  }

  return (
    <Layout>
      <div className="text-bold h-full overflow-scroll p-6 text-center font-jakarta text-lg text-mid-grey dark:text-white">
        <Board boardUUID={board.uuid} />
      </div>
    </Layout>
  );
}