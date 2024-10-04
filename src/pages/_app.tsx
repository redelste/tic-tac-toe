import type { AppProps } from 'next/app'
import { useAuthState } from 'react-firebase-hooks/auth'
import { auth } from '@/lib/firebase'
import Navbar from '@/components/Navbar'
import '@/styles/globals.css'
import styles from '@/styles/Layout.module.css'

type ExtendedAppProps = AppProps & {
  Component: AppProps['Component'] & {
    requireAuth?: boolean
  }
}

function MyApp({ Component, pageProps }: ExtendedAppProps) {
  const [user, loading] = useAuthState(auth);

  if (loading) return <div className={styles.fullPageCenter}>Loading...</div>;

  if (Component.requireAuth && !user) {
    return <div className={styles.fullPageCenter}>Please sign in to access this page</div>;
  }

  return (
    <div className={styles.layout}>
      <Navbar />
      <main className={styles.main}>
        <Component {...pageProps} user={user} />
      </main>
    </div>
  );
}

export default MyApp