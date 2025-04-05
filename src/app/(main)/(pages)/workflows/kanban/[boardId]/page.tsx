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

export async function generateMetadata({
  params,
}: {
  params: { boardId: string };
}): Promise<Metadata> {
  const { userId: clerkId } = auth(); // Changed to userId with alias
  if (!clerkId) return { title: 'Kanban Board' };

  const board = await getBoard(params.boardId, clerkId);
  return {
    title: board?.name ? `Kanban - ${board.name}` : 'Kanban Board',
    description: 'Task management web app',
  };
}

export default async function BoardPage({
  params,
}: {
  params: { boardId: string };
}) {
  const { userId: clerkId } = auth(); // Changed to userId with alias

  if (!clerkId) {
    redirect('/sign-in');
  }

  const board = await getBoard(params.boardId, clerkId);
  if (!board) notFound();

  return (
    <Layout>
      <div className="text-bold h-full overflow-scroll p-6 text-center font-jakarta text-lg text-mid-grey dark:text-white">
        <Board boardUUID={board.uuid} />
      </div>
    </Layout>
  );
}