// src/pages/game/[id].tsx
import { useRouter } from 'next/router';
import { useEffect, useState, useCallback } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { doc, updateDoc, onSnapshot } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import Board from '@/components/Board';
import MoveHistory from '@/components/MoveHistory';
import { GameState, Move } from '@/types/game';
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
            
            // If this is the second player joining, update the game
            if (gameData.players.length === 1 && !gameData.players.some(p => p.id === user.uid)) {
              const updatedGame = {
                ...gameData,
                players: [...gameData.players, { id: user.uid, name: user.displayName || 'Anonymous' }],
                currentPlayer: gameData.players[0].id // Set the first player to start
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

  const makeMove = useCallback(async (index: number) => {
    if (!game || !user || game.winner || game.board[index]) return;

    if (game.currentPlayer !== user.uid) {
      setError("It's not your turn!");
      return;
    }

    const newBoard = [...game.board];
    const symbol = game.players.findIndex(p => p.id === user.uid) === 0 ? 'X' : 'O';
    newBoard[index] = symbol;

    const newMove: Move = {
      player: user.uid,
      position: index,
      symbol,
      moveNumber: game.moves.length + 1
    };

    const updatedGame: Partial<GameState> = {
      board: newBoard,
      currentPlayer: game.players.find(p => p.id !== user.uid)?.id || null,
      moves: [...game.moves, newMove]
    };

    const winner = checkWinner(newBoard);
    if (winner) {
      updatedGame.winner = user.uid;
      updatedGame.endedAt = new Date();
    } else if (!newBoard.includes(null)) {
      updatedGame.winner = 'draw';
      updatedGame.endedAt = new Date();
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

  const getPlayerSymbol = () => {
    if (!game || !user) return null;
    const playerIndex = game.players.findIndex(p => p.id === user.uid);
    return playerIndex === 0 ? 'X' : 'O';
  };


  if (error) return <div className={styles.error}>{error}</div>;
  if (!game || !user) return <div className={styles.loading}>Loading...</div>;
  if (game.players.length < 2) return <div>Waiting for opponent to join...</div>;

  const isYourTurn = game.currentPlayer === user.uid;
  const playerSymbol = getPlayerSymbol();

  
  return (
    <div className={styles.gamePage}>
      <h1>Game {id}</h1>
      <div className={styles.playerInfo}>
        You are playing as: <span className={styles.playerSymbol}>{playerSymbol}</span>
      </div>
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
      <div className={styles.gameContent}>
        <Board
          board={game.board}
          onMove={makeMove}
          isYourTurn={isYourTurn && !game.winner}
        />
        <MoveHistory moves={game.moves} players={game.players} />
      </div>
    </div>
  );
};

export default GamePage;