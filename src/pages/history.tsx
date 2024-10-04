import { useEffect, useState } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { collection, query, where, getDocs, orderBy, updateDoc, doc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import Link from 'next/link';
import { GameWithId } from '@/types/game';
import styles from '@/styles/History.module.css';
import { useFormattedDate } from '@/hooks/useFormattedDate';
const HistoryPage = () => {
  const [user] = useAuthState(auth);
  const [games, setGames] = useState<GameWithId[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const formattedDate = useFormattedDate();
  useEffect(() => {
    const fetchGames = async () => {
      if (user) {
        try {
          const q = query(
            collection(db, 'games'),
            where('players', 'array-contains', { id: user.uid, name: user.displayName || 'Anonymous' }),
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

  const getGameResult = (game: GameWithId) => {
    if (game.cancelled) return "Cancelled";
    if (game.winner === 'draw') return "Draw";
    if (game.winner === user?.uid) return "Win";
    if (game.winner) return "Loss";
    return "Ongoing";
  };

  const getOpponentName = (game: GameWithId) => {
    const opponent = game.players.find(player => player.id !== user?.uid);
    return opponent ? opponent.name : 'Unknown';
  };

  const cancelGame = async (gameId: string) => {
    try {
      await updateDoc(doc(db, 'games', gameId), {
        cancelled: true,
        endedAt: formattedDate
      });
      setGames(games.map(game => 
        game.id === gameId ? { ...game, cancelled: true, endedAt: new Date() } : game
      ));
    } catch (err) {
      console.error("Error cancelling game:", err);
      setError("Failed to cancel game. Please try again.");
    }
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
              <Link href={`/game/${game.id}`}>
                <div className={styles.gameLink}>
                  <span className={styles.gameId}>Game {game.id.slice(0, 6)}...</span>
                  <span className={styles.gameResult}>{getGameResult(game)}</span>
                  <span className={styles.opponent}>vs {getOpponentName(game)}</span>
                  <span className={styles.gameMoves}>Moves: {game.moves.length}</span>
                  <span className={styles.gameDate}>
                    {game.endedAt 
                      ? `Ended: ${game.endedAt}` 
                      : `Started: ${game.createdAt}`}
                  </span>
                </div>
              </Link>
              {!game.winner && !game.cancelled && (
                <button 
                  onClick={() => cancelGame(game.id)} 
                  className={styles.cancelButton}
                >
                  Cancel Game
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default HistoryPage;
