import { FC, useEffect, useRef, useState } from "react";
import Column from "./Column/Column";
import {
  DragStartEvent,
  DragEndEvent,
  DragOverEvent,
  closestCorners
} from "@dnd-kit/core";
import {
  DndContext,
  useSensor,
  useSensors,
  MouseSensor,
  TouchSensor,
  MeasuringStrategy,
  UniqueIdentifier
} from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { Board as BoardT, Columns, Task } from "@/types";
import { fetcher, randomHexColor } from "@/utils/utils";
import useSWR from "swr";
import useInput from "@/hooks/useInput";
import BoardForm from "../Modals/BoardForm";
import useModal from "@/hooks/useModal";
import { PopoverLink } from "../Popover/Popover";
import usePopover from "@/hooks/usePopover";
import TaskForm from "../Modals/TaskForm";
import TaskDetails from "../Modals/TaskDetails";
import Link from "next/link";
const validateColumn = (value: string): [boolean, string] => {
  if (!value || value.trim().length < 1) return [false, "Can't be empty"];
  if (value.trim().length > 20) return [false, `${value.trim().length}/20`];
  return [true, ""];
};

const NewColumnBar: FC<{
  mutateBoard: Function;
  boardUUID: string;
}> = ({ mutateBoard, boardUUID }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const inputHandler = useInput<string>({ validateFn: validateColumn });
  const submitHandler = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!inputHandler.isValid) {
      inputHandler.setIsTouched(true);
      return;
    }
    const columnData = {
      board_uuid: boardUUID,
      name: inputHandler.value!.trim(),
      color: randomHexColor()
    };
    fetch("/api/columns", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(columnData)
    }).then(() => {
      inputRef.current?.blur();
      inputHandler.setIsTouched(false);
      inputHandler.setValue("");
      mutateBoard();
    });
  };

  return (
    <div className="relative mt-10 w-72">
      <form
        onSubmit={submitHandler}
        className={`sticky top-10 flex h-[80vh] max-h-[calc(100vh-260px)] w-72 items-center justify-center rounded-md bg-gradient-to-b from-[#E9EFFA] to-[#e9effa80] text-center text-2xl font-bold text-mid-grey transition-all dark:from-[#2b2c3740] dark:to-[#2b2c3720]`}
      >
        <fieldset className="relative">
          <input
            ref={inputRef}
            value={inputHandler.value ?? ""}
            onChange={inputHandler.valueChangeHandler}
            onBlur={inputHandler.inputBlurHandler}
            id="new-column"
            type="text"
            className="peer absolute w-56 -translate-x-1/2 bg-transparent py-1 text-center text-lg text-black caret-primary-light opacity-0 transition-all hover:outline-none focus:opacity-100 focus:outline-none dark:text-white"
          />
          <div
            className={`absolute h-[3px] w-56 -translate-x-1/2 translate-y-10 scale-x-0 rounded transition-all peer-focus:scale-x-100 ${
              inputHandler.hasError ? "bg-danger" : "bg-primary "
            }`}
          />
          {inputHandler.hasError && (
            <span className="absolute top-12 hidden min-w-max -translate-x-1/2 text-sm text-danger peer-focus:block">
              {inputHandler.errorMsg}
            </span>
          )}
          <label
            htmlFor="new-column"
            className="absolute z-10 w-56 -translate-x-1/2 cursor-pointer transition-all hover:text-primary peer-focus:-translate-y-12 peer-focus:scale-75 peer-focus:text-primary"
          >
            + New Column
          </label>
        </fieldset>
      </form>
    </div>
  );
};

const Board: FC<{ boardUUID: string }> = (props) => {
  const boardData = useSWR<BoardT>(
    `/api/boards/${props.boardUUID}`,
    fetcher,
    {}
  );
  const [selectedTask, setSelectedTask] = useState<any | null>(null);
  const sortedColumns = boardData.data?.columns.sort(
    (a, b) => a.position - b.position
  );
  const editBoardModal = useModal();
  const EditBoardModal = editBoardModal.Component;
  const newTaskModal = useModal();
  const NewTaskModal = newTaskModal.Component;
  const editTaskModal = useModal();
  const EditTaskModal = editTaskModal.Component;
  const [items, setItems] = useState<Columns>({});
  const [clonedItems, setClonedItems] = useState<Columns | null>(items);
  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);
  const [draggedTask, setDraggedTask] = useState<Task | null>(null);
  const { Component: Popover, ...optionsPopover } = usePopover();
  const handleNewTask = () => {
    newTaskModal.toggle();
  };
  useEffect(() => {
    const newValue: Columns = {};
    if (!boardData.data) return;
    for (const column of boardData.data.columns) {
      newValue[column.name] = {
        board_uuid: column.board_uuid,
        position: column.position,
        uuid: column.uuid,
        color: column.color,
        tasks: column.tasks ?? []
      };
    }
    setItems(newValue);
  }, [boardData.data?.columns, boardData.error]);

  const mouseSensor = useSensor(MouseSensor, {
    // Require the mouse to move by 10 pixels before activating
    activationConstraint: {
      distance: 10
    }
  });
  const touchSensor = useSensor(TouchSensor, {
    activationConstraint: {
      delay: 250,
      tolerance: 10
    }
  });

  const sensors = useSensors(mouseSensor, touchSensor);

  function findContainer(id: UniqueIdentifier, items: Columns | null) {
    if (!items) return null;
    if (id in items) {
      return id;
    }

    return Object.keys(items).find((key) =>
      items[key].tasks.some((task) => task.uuid === id)
    );
  }

  function handleDragStart(event: DragStartEvent) {
    const { active } = event;
    const { id } = active;
    const startingContainer = findContainer(id, items);
    const taskObject =
      startingContainer &&
      items[startingContainer].tasks.find((task) => task.uuid === id);
    if (taskObject) {
      setDraggedTask(taskObject);
      setActiveId(id);
      setClonedItems(items);
    } else {
      return;
    }
  }

  function handleDragOver(event: DragOverEvent) {
    const { active, over } = event;
    const { id } = active;
    const overId = over?.id;
    if (!overId) return;

    // Find the containers
    const activeContainer = findContainer(id, items);
    const overContainer = findContainer(overId, items);

    if (
      !activeContainer ||
      !overContainer ||
      activeContainer === overContainer
    ) {
      return;
    }

    setItems((prev) => {
      const activeItems = prev[activeContainer].tasks;
      const overItems = prev[overContainer].tasks;

      // Find the indexes for the items
      const activeIndex = activeItems
        .map((task) => task.uuid as UniqueIdentifier)
        .indexOf(id);
      const overIndex = overItems
        .map((task) => task.uuid as UniqueIdentifier)
        .indexOf(overId);

      let newIndex;
      if (overId in prev) {
        // We're at the root droppable of a container
        newIndex = overItems.length + 1;
      } else {
        const isBelowLastItem = over && overIndex === overItems.length - 1;
        const modifier = isBelowLastItem ? 1 : 0;

        newIndex = overIndex >= 0 ? overIndex + modifier : overItems.length + 1;
      }

      return {
        ...prev,
        [activeContainer]: {
          ...prev[activeContainer],
          tasks: [
            ...prev[activeContainer].tasks.filter(
              (task) => task.uuid !== active.id
            )
          ]
        },
        [overContainer]: {
          ...prev[overContainer],
          tasks: [
            ...prev[overContainer].tasks.slice(0, newIndex),
            items[activeContainer].tasks[activeIndex],
            ...prev[overContainer].tasks.slice(
              newIndex,
              prev[overContainer].tasks.length
            )
          ]
        }
      };
    });
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    const { id } = active;
    const overId = over?.id;
    if (!overId || !clonedItems || !activeId) return;

    const activeContainer = findContainer(id, items);
    const overContainer = findContainer(overId, items);
    const startingContainer = findContainer(activeId, clonedItems);

    if (!activeContainer || !overContainer || !startingContainer) {
      return;
    }

    const startingIndex = clonedItems[startingContainer].tasks
      .map((task) => task.uuid as UniqueIdentifier)
      .indexOf(activeId);
    const activeIndex = items[activeContainer].tasks
      .map((task) => task.uuid as UniqueIdentifier)
      .indexOf(id);
    const overIndex = items[overContainer].tasks
      .map((task) => task.uuid as UniqueIdentifier)
      .indexOf(overId);

    if (activeIndex !== overIndex) {
      setItems((items) => ({
        ...items,
        [overContainer]: {
          ...items[overContainer],
          tasks: arrayMove(items[overContainer].tasks, activeIndex, overIndex)
        }
      }));
    }
    if (activeId && clonedItems && draggedTask) {
      const dragData = {
        overIndex:
          overIndex !== -1 ? overIndex : items[overContainer].tasks.length - 1,
        overContainer: items[overContainer].uuid
      };
      // Update the task if it was moved to a different container or index
      if (startingContainer === overContainer && startingIndex === overIndex) {
        boardData.mutate();
      } else {
        fetch(`/api/tasks/${draggedTask.uuid}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            column_uuid: dragData.overContainer,
            position: dragData.overIndex
          })
        }).then(() => {
          boardData.mutate();
        });
      }
    }
    setClonedItems(null);
    setActiveId(null);
  }
  const handleEditBoard = () => {
    editBoardModal.open();
  };
  const handleBoardUpdate = () => {
    editBoardModal.close();
    boardData.mutate();
  };
  function handleEditTask(task: any) {
    setSelectedTask(task);
    editTaskModal.open();
  }
  return (
    <div className="flex flex-col relative h-full">
      <h1 className="text-4xl sticky top-0 z-[10] p-6 bg-background/50 backdrop-blur-lg flex items-center border-b justify-between">
        {boardData.data?.name}
        <div className=" flex gap-6">
          <PopoverLink onClick={() => {}} id="board-edit">
            <Link href={`/workflows/editor/${props.boardUUID}`}>Editor</Link>
          </PopoverLink>

          <PopoverLink onClick={handleNewTask} id="board-edit">
            Add Task
          </PopoverLink>
          <PopoverLink onClick={handleEditBoard} id="board-edit">
            Edit Board
          </PopoverLink>
        </div>
      </h1>
      <div className="p-6 overflow-scroll flex-1">
        <section className="grid h-full w-fit auto-cols-min grid-flow-col gap-6">
          <DndContext
            sensors={sensors}
            measuring={{
              droppable: {
                strategy: MeasuringStrategy.Always
              }
            }}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
          >
            {items &&
              Object.entries(items)
                .sort(([_col, a], [_col2, b]) => a.position - b.position)
                .map(([colName, colData]) => {
                  return (
                    <Column
                      key={colName}
                      name={colName}
                      columnData={colData}
                      onTaskClick={handleEditTask}
                    />
                  );
                })}
            {boardData.data && (
              <NewColumnBar
                boardUUID={boardData.data.uuid}
                mutateBoard={boardData.mutate}
              />
            )}
          </DndContext>
        </section>
      </div>
      <EditBoardModal>
        <BoardForm
          formType="edit"
          boardData={boardData.data}
          onBoardUpdated={handleBoardUpdate}
        />
      </EditBoardModal>
      <NewTaskModal>
        <TaskForm
          formType="new"
          closeModal={newTaskModal.close}
          columns={sortedColumns}
        />
      </NewTaskModal>
      <EditTaskModal>
        {boardData.data && selectedTask && (
          <TaskDetails
            closeModal={editTaskModal.close}
            taskUUID={selectedTask.uuid!}
            columns={boardData.data.columns}
            board={boardData}
          />
        )}
      </EditTaskModal>
    </div>
  );
};

export default Board;
