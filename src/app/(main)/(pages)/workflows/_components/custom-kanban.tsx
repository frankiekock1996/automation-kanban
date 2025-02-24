'use client';

import React, {
  Dispatch,
  SetStateAction,
  useState,
  DragEvent,
  FormEvent,
  useCallback,
} from 'react';
import { FiPlus, FiTrash } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { FaFire } from 'react-icons/fa';
import Link from 'next/link';
import { CardWithForm } from '../kanban/[kanbanid]/kanban-card';
import { v4 as uuidv4 } from 'uuid';

type CardType = {
  id: string;
  title: string;
  column: ColumnType;
  orderNumber: string;
  serviceTag: string;
};

type ColumnType = 'backlog' | 'todo' | 'doing' | 'done';

export const CustomKanban = () => {
  const [cards, setCards] = useState<CardType[]>([]);

  const handleAddCard = useCallback((column: ColumnType, orderNumber: string, serviceTag: string) => {
    console.log(`Adding card to ${column}: Order Number - ${orderNumber}, Service Tag - ${serviceTag}`);
    const newCard: CardType = {
      id: uuidv4(),
      title: `Order: ${orderNumber} - Tag: ${serviceTag}`,
      column,
      orderNumber,
      serviceTag,
    };
    setCards((prevCards) => {
      const updatedCards = [...prevCards, newCard];
      console.log('CustomKanban: Updated cards state:', updatedCards);
      return updatedCards;
    });
  }, []);

  return (
    <div className="flex h-full w-full gap-3 overflow-scroll p-12">
      {['backlog', 'todo', 'doing', 'done'].map((columnType) => (
        <Column
          key={columnType}
          title={columnType.charAt(0).toUpperCase() + columnType.slice(1)}
          column={columnType as ColumnType}
          headingColor={getHeadingColor(columnType as ColumnType)}
          cards={cards}
          setCards={setCards}
          onAddCard={handleAddCard}
        />
      ))}
      <BurnBarrel setCards={setCards} />
    </div>
  );
};

type ColumnProps = {
  title: string;
  headingColor: string;
  cards: CardType[];
  column: ColumnType;
  setCards: Dispatch<SetStateAction<CardType[]>>;
  onAddCard: (column: ColumnType, orderNumber: string, serviceTag: string) => void;
};

const Column = ({
  title,
  headingColor,
  cards,
  column,
  setCards,
  onAddCard,
}: ColumnProps) => {
  const [active, setActive] = useState(false);
  // const filteredCards = cards.filter((c) => c.column === column);
  const filteredCards = React.useMemo(() => {
    console.log(`Filtering cards for column: ${column}`);
    return cards.filter((c) => c.column === column);
  }, [cards, column]);
    
  const handleDragStart = (e: DragEvent, card: CardType) => {
    e.dataTransfer.setData('cardId', card.id);
  };

  const handleDragEnd = (e: DragEvent) => {
    const cardId = e.dataTransfer.getData('cardId');
    setActive(false);
    clearHighlights();

    const indicators = getIndicators();
    const { element } = getNearestIndicator(e, indicators);
    const before = element.dataset.before || '-1';

    if (before !== cardId) {
      let copy = [...cards];
      let cardToTransfer = copy.find((c) => c.id === cardId);
      if (!cardToTransfer) return;
      cardToTransfer = { ...cardToTransfer, column };

      copy = copy.filter((c) => c.id !== cardId);
      const moveToBack = before === '-1';

      if (moveToBack) {
        copy.push(cardToTransfer);
      } else {
        const insertAtIndex = copy.findIndex((el) => el.id === before);
        if (insertAtIndex === -1) return; 
        copy.splice(insertAtIndex, 0, cardToTransfer);
      }

      setCards(copy);
    }
  };

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
    highlightIndicator(e);
    setActive(true);
  };

  const clearHighlights = (els?: HTMLElement[]) => {
    const indicators = els || getIndicators();
    indicators.forEach((i) => {
      i.style.opacity = '0';
    });
  };

  const highlightIndicator = (e: DragEvent) => {
    const indicators = getIndicators();
    clearHighlights(indicators);
    const el = getNearestIndicator(e, indicators);
    el.element.style.opacity = '1';
  };

  const getNearestIndicator = (e: DragEvent, indicators: HTMLElement[]) => {
    const DISTANCE_OFFSET = 50;

    const el = indicators.reduce(
      (closest, child) => {
        const box = child.getBoundingClientRect();
        const offset = e.clientY - (box.top + DISTANCE_OFFSET);

        if (offset < 0 && offset > closest.offset) {
          return { offset: offset, element: child };
        } else {
          return closest;
        }
      },
      {
        offset: Number.NEGATIVE_INFINITY,
        element: indicators[indicators.length - 1],
      }
    );

    return el;
  };

  const getIndicators = () => {
    return Array.from(
      document.querySelectorAll(`[data-column="${column}"]`) as unknown as HTMLElement[]
    );
  };

  const handleDragLeave = () => {
    clearHighlights();
    setActive(false);
  };

  return (
    <div className="w-56 shrink-0">
      <div className="mb-3 flex items-center justify-between">
        <h3 className={`font-medium ${headingColor}`}>{title}</h3>
        <span className="rounded text-sm text-neutral-400">{filteredCards.length}</span>
      </div>
      <div
        onDrop={handleDragEnd}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`h-full w-full transition-colors ${
          active ? 'bg-neutral-800/50' : 'bg-neutral-800/0'
        }`}
      >
        {filteredCards.map((c) => (
          <Card key={c.id} {...c} handleDragStart={handleDragStart} />
        ))}
        <DropIndicator beforeId={null} column={column} />
        <AddCard column={column} onAddCard={onAddCard} />
      </div>
    </div>
  );
};


type CardProps = CardType & {
  handleDragStart: Function;
};
const Card = ({ title, id, column, orderNumber, serviceTag, handleDragStart }: CardProps) => {
  return (
    <>
      <DropIndicator beforeId={id} column={column} />
      {/* <Link href={`/workflows/kanban/${id}`}> */}
        <motion.div
          layout
          layoutId={id}
          draggable="true"
          onDragStart={(e) => 
            handleDragStart(e as unknown as DragEvent<HTMLDivElement>, { id, title, column, orderNumber, serviceTag })
          }
          className="cursor-grab rounded border border-neutral-700 bg-neutral-800 p-3 active:cursor-grabbing"
        >
          <p className="text-sm text-neutral-100">{title}</p>
          <p className="text-xs text-neutral-400">Order Number: {orderNumber}</p>
          <p className="text-xs text-neutral-400">Service Tag: {serviceTag}</p>
        </motion.div>
      {/* </Link> */}
    </>
  );
};

type DropIndicatorProps = {
  beforeId: string | null;
  column: string;
};

const DropIndicator = ({ beforeId, column }: DropIndicatorProps) => {
  return (
    <div
      data-before={beforeId || '-1'}
      data-column={column}
      className="my-0.5 h-0.5 w-full bg-violet-400 opacity-0"
    />
  );
};

const BurnBarrel = ({
  setCards,
}: {
  setCards: Dispatch<SetStateAction<CardType[]>>;
}) => {
  const [active, setActive] = useState(false);

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
    setActive(true);
  };

  const handleDragLeave = () => {
    setActive(false);
  };

  const handleDrop = (e: DragEvent) => {
    const cardId = e.dataTransfer.getData('cardId');
    setCards((cards) => cards.filter((c) => c.id !== cardId));
    setActive(false);
  };

  return (
    <motion.div
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      className={`mt-10 grid h-56 w-56 shrink-0 place-content-center rounded border text-3xl transition-colors ${
        active
          ? "border-red-800 bg-red-800/20 text-red-500"
          : "border-neutral-500 bg-neutral-500/20 text-neutral-500"
      }`}
    >
      <AnimatePresence>
        {active ? (
          <motion.div
            key="fire"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <FaFire className="animate-bounce" />
          </motion.div>
        ) : (
          <motion.div
            key="trash"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <FiTrash />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

type AddCardProps = {
  column: ColumnType;
  onAddCard: (column: ColumnType, orderNumber: string, serviceTag: string) => void; 
};

const AddCard: React.FC<AddCardProps> = React.memo(({ column, onAddCard }) => {
  const [adding, setAdding] = useState(false);

  const handleAddCard = useCallback((orderNumber: string, serviceTag: string) => {
    console.log(`AddCard: Attempting to add card to ${column}`);
    onAddCard(column, orderNumber, serviceTag);
    console.log(`AddCard: Card added to ${column}, closing form`);
    setAdding(false);
  }, [column, onAddCard]);

  const closeForm = useCallback(() => {
    console.log(`AddCard: Closing form for ${column}`);
    setAdding(false);
  }, [column]);

  return (
    <div>
      {adding ? (
        <CardWithForm 
          onSubmit={handleAddCard}
          onCancel={closeForm}
          column={column}
        />
      ) : (
        <motion.button
          layout
          layoutId={`add-card-${column}`}
          onClick={() => {
            console.log(`Clicked Add Card for column: ${column}`);
            setAdding(true);
          }}
          className="flex w-full items-center gap-2 rounded border border-dashed border-neutral-700 p-3 text-neutral-500"
        >
          <FiPlus className="text-neutral-500" />
          Add card
        </motion.button>
      )}
    </div>
  );
});


const DEFAULT_CARDS: CardType[] = [];

const getHeadingColor = (column: ColumnType): string => {
  switch (column) {
    case 'backlog':
      return 'text-neutral-500';
    case 'todo':
      return 'text-yellow-200';
    case 'doing':
      return 'text-blue-200';
    case 'done':
      return 'text-emerald-200';
    default:
      return 'text-neutral-500';
  }
};


