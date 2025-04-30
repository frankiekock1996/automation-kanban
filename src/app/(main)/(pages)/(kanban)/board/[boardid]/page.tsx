"use client";
import Board from "../../_components/Board/Board";
export default function BoardPage({ params }: { params: { boardId: string } }) {
  const uuid = params.boardId;
  return <Board boardUUID={uuid} />;
}
