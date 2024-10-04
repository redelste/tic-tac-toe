// src/components/MoveHistory.tsx
import React from 'react';
import { Move, PlayerInfo } from '@/types/game';
import styles from '@/styles/MoveHistory.module.css';

interface MoveHistoryProps {
  moves: Move[];
  players: PlayerInfo[];
}

const MoveHistory: React.FC<MoveHistoryProps> = ({ moves, players }) => {
  const getPlayerName = (playerId: string) => {
    const player = players.find(p => p.id === playerId);
    return player ? player.name : 'Unknown';
  };

  return (
    <div className={styles.moveHistory}>
      <h3>Move History</h3>
      <ul className={styles.moveList}>
        {moves.map((move, index) => (
          <li key={index} className={styles.moveItem}>
            <span className={styles.moveNumber}>{move.moveNumber}.</span>
            <span className={styles.playerSymbol}>
              {move.symbol} ({getPlayerName(move.player)})
            </span>
            <span className={styles.movePosition}>
              Position: {move.position + 1}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default MoveHistory;