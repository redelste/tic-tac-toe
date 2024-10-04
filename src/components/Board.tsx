import React, { memo } from 'react';
import styles from '@/styles/Board.module.css';

interface BoardProps {
  board: (string | null)[];
  onMove: (index: number) => void;
  isYourTurn: boolean;
  status: boolean;
}

const Board: React.FC<BoardProps> = memo(({ board, onMove, isYourTurn, status}) => {
  return (
    <div className={styles.board}>
      {board.map((cell, index) => (
        <button
          key={index}
          className={styles.cell}
          onClick={() => onMove(index)}
          disabled={!isYourTurn || !!cell || status}
          aria-label={`Cell ${index + 1}, ${cell || 'empty'}`}
        >
          {cell}
        </button>
      ))}
    </div>
  );
});

Board.displayName = 'Board';

export default Board;