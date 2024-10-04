// src/pages/index.tsx
import { useState } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { collection, addDoc } from 'firebase/firestore';
import Link from 'next/link';
import styles from '@/styles/Home.module.css';

export default function Home() {
  const [user] = useAuthState(auth);
  const [gameId, setGameId] = useState('');
  const [joinGameId, setJoinGameId] = useState('');

  const signIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Error signing in with Google", error);
    }
  };

  const createGame = async () => {
    if (!user) return;

    try {
      const gameRef = await addDoc(collection(db, 'games'), {
        players: [{ id: user.uid, name: user.displayName || 'Anonymous' }],
        board: Array(9).fill(null),
        currentPlayer: null,
        winner: null,
        moves: [],
        createdAt: new Date(),
        endedAt: null
      });

      setGameId(gameRef.id);
    } catch (error) {
      console.error("Error creating new game", error);
    }
  };

  return (
    <div className={styles.container}>
      <h1>Tic-tac-toe</h1>
      {user ? (
        <>
          <p>Welcome, {user.displayName}!</p>
          <button onClick={createGame}>Create New Game</button>
          {gameId && (
            <Link href={`/game/${gameId}`}>
              Join Game {gameId}
            </Link>
          )}
          <div>
            <input 
              type="text" 
              value={joinGameId} 
              onChange={(e) => setJoinGameId(e.target.value)} 
              placeholder="Enter Game ID to join"
            />
            <Link href={`/game/${joinGameId}`}>
              Join Game
            </Link>
          </div>
          <Link href="/history">
            View Game History
          </Link>
        </>
      ) : (
        <button onClick={signIn}>Sign in with Google</button>
      )}
    </div>
  );
}