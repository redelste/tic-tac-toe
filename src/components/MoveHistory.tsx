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
    <div className={styles.moveHistory} role="region" aria-labelledby="moveHistoryTitle">
      <h2 id="moveHistoryTitle" className={styles.moveHistoryTitle}>Move History</h2>
      <ul className={styles.moveList} role="list">
        {moves.map((move, index) => (
          <li key={index} className={styles.moveItem} role="listitem">
            <span className={styles.moveNumber} aria-label={`Move ${move.moveNumber}`}>
              {move.moveNumber}.
            </span>
            <span
              className={styles.playerSymbol}
              aria-label={`Player ${getPlayerName(move.player)} played ${move.symbol}`}
            >
              {move.symbol} ({getPlayerName(move.player)})
            </span>
            <span className={styles.movePosition} aria-label={`Position: ${move.position + 1}`}>
              Position: {move.position + 1}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default MoveHistory;