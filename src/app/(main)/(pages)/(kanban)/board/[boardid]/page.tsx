"use client";
import Board from "../../_components/Board/Board";
export default function BoardPage({ params }: { params: { boardid: string } }) {
  console.log("Board Page Params:", params);
  const uuid = params.boardid;
  return <Board boardUUID={uuid} />;
}
