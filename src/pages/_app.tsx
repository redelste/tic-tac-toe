import type { AppProps } from 'next/app'
import { useAuthState } from 'react-firebase-hooks/auth'
import { auth } from '@/lib/firebase'
import Navbar from '@/components/Navbar'
import '@/styles/globals.css'

type ExtendedAppProps = AppProps & {
  Component: AppProps['Component'] & {
    requireAuth?: boolean
  }
}

function MyApp({ Component, pageProps }: ExtendedAppProps) {
  const [user, loading] = useAuthState(auth);

  if (loading) return <div>Loading...</div>;

  if (Component.requireAuth && !user) {
    return <div>Please sign in to access this page</div>;
  }

  return (
    <>
      <Navbar />
      <Component {...pageProps} user={user} />
    </>
  );
}

export default MyApp