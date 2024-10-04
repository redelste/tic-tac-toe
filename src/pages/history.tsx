// src/pages/history.tsx
import { useEffect, useState } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import Link from 'next/link';
import { GameWithId } from '@/types/game';
import styles from '@/styles/History.module.css';

const HistoryPage = () => {
  const [user] = useAuthState(auth);
  const [games, setGames] = useState<GameWithId[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchGames = async () => {
      if (user) {
        try {
          const q = query(
            collection(db, 'games'),
            where('players', 'array-contains', user.uid),
            orderBy('createdAt', 'desc')
          );
          const querySnapshot = await getDocs(q);
          setGames(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as GameWithId)));
          setLoading(false);
        } catch (err) {
          console.error("Error fetching games:", err);
          setError("Failed to load game history. Please try again later.");
          setLoading(false);
        }
      }
    };

    fetchGames();
  }, [user]);

  const getGameStatus = (game: GameWithId, userId: string): string => {
    if (game.winner === 'draw') return "It's a draw!";
    if (game.winner === userId) return 'You won!';
    if (game.winner) return 'You lost';
    return 'Ongoing';
  };

  const getStatusClass = (game: GameWithId, userId: string): string => {
    if (game.winner === 'draw') return styles.draw;
    if (game.winner === userId) return styles.winner;
    if (game.winner) return styles.loser;
    return styles.ongoing;
  };

  if (!user) return <div className={styles.message}>Please sign in to view your game history.</div>;
  if (loading) return <div className={styles.message}>Loading game history...</div>;
  if (error) return <div className={styles.error}>{error}</div>;

  return (
    <div className={styles.historyPage}>
      <h1>Your Game History</h1>
      {games.length === 0 ? (
        <p className={styles.noGames}>You haven&apos;t played any games yet.</p>
      ) : (
        <ul className={styles.gameList}>
          {games.map((game) => (
            <li key={game.id} className={styles.gameItem}>
              <Link href={`/game/${game.id}`} className={styles.gameLink}>
                <span className={styles.gameId}>Game {game.id.slice(0, 6)}...</span>
                <span className={`${styles.gameStatus} ${getStatusClass(game, user.uid)}`}>
                  {getGameStatus(game, user.uid)}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );

};

export default HistoryPage;