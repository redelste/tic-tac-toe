// src/pages/game/[id].tsx
import { useRouter } from 'next/router';
import { useEffect, useState, useCallback } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { doc, updateDoc, onSnapshot } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import Board from '@/components/Board';
import { GameState } from '@/types/game';
import styles from '@/styles/Game.module.css';

const GamePage = () => {
  const router = useRouter();
  const { id } = router.query;
  const [user] = useAuthState(auth);
  const [game, setGame] = useState<GameState | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let unsubscribe: () => void;

    const setupGameListener = () => {
      if (id && user) {
        const gameRef = doc(db, 'games', id as string);
        unsubscribe = onSnapshot(gameRef, async (doc) => {
          if (doc.exists()) {
            const gameData = doc.data() as GameState;
            
            if (gameData.players.length === 1 && !gameData.players.includes(user.uid)) {
              const updatedGame = {
                ...gameData,
                players: [...gameData.players, user.uid],
                currentPlayer: gameData.players[0]
              };
              await updateDoc(gameRef, updatedGame);
            } else {
              setGame(gameData);
            }
            setError(null);
          } else {
            setError('Game not found');
          }
        }, (err) => {
          console.error("Error getting real-time updates:", err);
          setError('Error getting game updates. Please try refreshing the page.');
        });
      }
    };

    setupGameListener();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [id, user]);

  // Reconnection logic
  useEffect(() => {
    let reconnectAttempts = 0;
    const maxReconnectAttempts = 5;
    let reconnectInterval: NodeJS.Timeout;

    if (error) {
      reconnectInterval = setInterval(() => {
        if (reconnectAttempts < maxReconnectAttempts) {
          console.log('Attempting to reconnect...');
          // Re-run the effect to attempt reconnection
          reconnectAttempts++;
          setError(null); // This will trigger the main useEffect to run again
        } else {
          clearInterval(reconnectInterval);
          setError('Unable to connect after several attempts. Please refresh the page.');
        }
      }, 5000); // Try to reconnect every 5 seconds
    }

    return () => {
      if (reconnectInterval) {
        clearInterval(reconnectInterval);
      }
    };
  }, [error]);

  const makeMove = useCallback(async (index: number) => {
    if (!game || !user || game.winner || game.board[index]) return;

    if (game.currentPlayer !== user.uid) {
      setError("It's not your turn!");
      return;
    }

    const newBoard = [...game.board];
    newBoard[index] = game.players.indexOf(user.uid) === 0 ? 'X' : 'O';

    const updatedGame = {
      ...game,
      board: newBoard,
      currentPlayer: game.players.find(playerId => playerId !== user.uid) || game.currentPlayer,
      moves: [...game.moves, { player: user.uid, position: index }]
    };

    // Check for winner
    const winner = checkWinner(newBoard);
    if (winner) {
      updatedGame.winner = user.uid;
    } else if (!newBoard.includes(null)) {
      updatedGame.winner = 'draw';
    }

    try {
      await updateDoc(doc(db, 'games', id as string), updatedGame);
    } catch (err) {
      console.error("Error updating game:", err);
      setError('Failed to make move. Please try again.');
    }
  }, [game, user, id]);

  const checkWinner = (board: (string | null)[]) => {
    const lines = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6],
    ];
    for (let i = 0; i < lines.length; i++) {
      const [a, b, c] = lines[i];
      if (board[a] && board[a] === board[b] && board[a] === board[c]) {
        return board[a];
      }
    }
    return null;
  };

  const returnHome = () => {
    router.push('/');
  };

  if (error) return <div className={styles.error}>{error}</div>;
  if (!game || !user) return <div className={styles.loading}>Loading...</div>;
  if (game.players.length < 2) return <div>Waiting for opponent to join...</div>;

  const isYourTurn = game.currentPlayer === user.uid;

  return (
    <div className={styles.gamePage}>
      <h1>Game {id}</h1>
      <p className={styles.currentPlayer}>
        Current Player: {isYourTurn ? 'Your turn' : "Opponent's turn"}
      </p>
      {game.winner && (
        <div>
          <p className={game.winner === 'draw' ? styles.draw : styles.winner}>
            {game.winner === 'draw' 
              ? "It's a draw!" 
              : game.winner === user.uid 
                ? 'You won!' 
                : 'Opponent won!'}
          </p>
          <button onClick={returnHome} className={styles.returnButton}>
            Return to Home
          </button>
        </div>
      )}
      <Board
        board={game.board}
        onMove={makeMove}
        isYourTurn={isYourTurn && !game.winner}
      />
    </div>
  );
};

export default GamePage;