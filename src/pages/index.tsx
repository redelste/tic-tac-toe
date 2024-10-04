// src/pages/index.tsx
import { useCallback, useState } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { collection, addDoc } from 'firebase/firestore';
import Link from 'next/link';
import styles from '@/styles/Home.module.css';
import { useCopyToClipboard } from '@/hooks/useCopyToClipboard';
import { useRouter } from 'next/router';

export default function Home() {
  const [user] = useAuthState(auth);
  const [gameId, setGameId] = useState('');
  const [joinGameId, setJoinGameId] = useState('');
  const router = useRouter();
  const { id } = router.query;
  const { copyToClipboard, copySuccess } = useCopyToClipboard();


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

  const handleJoinGame = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (!joinGameId.trim()) {
      e.preventDefault();
    }
  };

  const handleCopyGameId = useCallback(() => {
    if (id) {
      copyToClipboard(id as string);
    }
  }, [id, copyToClipboard]);


  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Tic-tac-toe</h1>
      {user ? (
        <div className={styles.content}>
          <p className={styles.welcome}>Welcome, {user.displayName}!</p>
          <button onClick={createGame} className={styles.button}>Create New Game</button>
          {gameId && (
            <div className={styles.gameIdContainer}>
              <span className={styles.gameId}>Game ID: {gameId}</span>
              <button onClick={handleCopyGameId} className={styles.copyButton}>
                Copy ID
              </button>
              {copySuccess && <span className={styles.copySuccess}>{copySuccess}</span>}
            </div>
          )}
          {gameId && (
            <Link href={`/game/${gameId}`} className={styles.link}>
              Join Game
            </Link>
          )}
          <div className={styles.joinGameContainer}>
            <input 
              type="text" 
              value={joinGameId} 
              onChange={(e) => setJoinGameId(e.target.value)} 
              placeholder="Enter Game ID to join"
              className={styles.input}
            />
            <Link 
              href={joinGameId.trim() ? `/game/${joinGameId}` : '#'}
              onClick={handleJoinGame}
              className={`${styles.link} ${joinGameId.trim() ? styles.activeLink : styles.disabledLink}`}
            >
              Join Game
            </Link>
          </div>
          <Link href="/history" className={styles.link}>
            View Game History
          </Link>
        </div>
      ) : (
        <button onClick={signIn} className={styles.signInButton}>Sign in with Google</button>
      )}
    </div>
  );
}