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
    <nav className={styles.navbar}>
      <Link href="/" className={styles.navLink}>
        Home
      </Link>
      {user && (
        <>
          <Link href="/history" className={styles.navLink}>
            Game History
          </Link>
          <button onClick={handleLogout} className={styles.logoutButton}>
            Logout
          </button>
        </>
      )}
    </nav>
  );
};

export default Navbar;