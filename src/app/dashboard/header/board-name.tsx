'use client';

import { useActiveBoard } from '../context/kanban-context';

export const BoardName = () => {
  const board = useActiveBoard();
  if (!board) return null;
  return <h1 className='hidden md:block pl-6 text-xl lg:text-2xl font-bold'>{board.name}</h1>;
};
