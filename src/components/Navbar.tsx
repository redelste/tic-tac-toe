import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/lib/firebase';
import { signOut } from 'firebase/auth';
import Link from 'next/link';
import styles from '@/styles/Navbar.module.css';

const Navbar = () => {
  const [user] = useAuthState(auth);

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <nav className={styles.navbar} aria-label="Main Navigation">
      <Link href="/" className={styles.navLink} aria-label="Go to homepage">
        Home
      </Link>
      {user && (
        <>
          <div className={styles.title} role="heading" aria-level={1}>
            Tic-Tac-Toe!
          </div>
          <button 
            onClick={handleLogout} 
            className={styles.logoutButton} 
            aria-label="Logout from the application"
          >
            Logout
          </button>
        </>
      )}
    </nav>
  );
};

export default Navbar;
