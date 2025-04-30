import { useRouter } from "next/router";
import React, { PropsWithChildren, useEffect } from "react";
import { Board } from "../types";
import useSWR from "swr";
import type { KeyedMutator } from "swr";
import { fetcher } from "../utils/utils";
import { useSession } from "next-auth/react";

export type BoardContextProps = {
  board?: Board;
  selectedBoard: Board | null;
  selectedTask: string | null;
  setSelectedTask: React.Dispatch<React.SetStateAction<string | null>>;
  mutateboard: KeyedMutator<Board>;
  isLoading: boolean;
  isValidating: boolean;
  error: any;
};

export const BoardContext = React.createContext<BoardContextProps>({
  board: undefined,
  selectedBoard: null,
  selectedTask: null,
  setSelectedTask: () => null,
  isLoading: false,
  isValidating: false,
  error: null,
  mutateboard: () => Promise.resolve(undefined)
});

const BoardContextProvider: React.FC<
  PropsWithChildren<{ value?: BoardContextProps }>
> = (props) => {
  const session = useSession();
  if (!session || session.status === "unauthenticated") {
    return <>{props.children}</>;
  }
  const router = useRouter();
  const [selectedBoard, setSelectedBoard] = React.useState<Board | null>(null);
  const [selectedTask, setSelectedTask] = React.useState<string | null>(null);
  const {
    data: board,
    mutate: mutateboard,
    isLoading,
    isValidating,
    error
  } = useSWR<Board>(`/api/board`, fetcher);

  useEffect(() => {
    setSelectedBoard(board!);
  }, [board, router.query.boardId]);

  const contextValue = {
    board,
    selectedBoard,
    selectedTask,
    setSelectedTask,
    isLoading,
    isValidating,
    error,
    mutateboard
  };

  return (
    <BoardContext.Provider value={props.value ?? contextValue}>
      {props.children}
    </BoardContext.Provider>
  );
};

export function useboardContext() {
  const context = React.useContext(BoardContext);

  if (!context) {
    throw new Error("You need to wrap Provider.");
  }

  return context;
}

export default BoardContextProvider;
