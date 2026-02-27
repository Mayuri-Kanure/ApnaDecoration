import '../styles/globals.css';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Toaster } from 'react-hot-toast';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import theme from '../theme';  // Local theme file
import DeliveryLayout from '../components/DeliveryLayout';

function MyApp({ Component, pageProps }) {
  const router = useRouter();

  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem('deliveryBoyToken');
    const publicRoutes = ['/auth/login', '/auth/register'];
    
    if (!token && !publicRoutes.includes(router.pathname)) {
      router.push('/auth/login');
    }
  }, [router.pathname]);

  // Don't show layout for auth pages
  const isAuthPage = router.pathname.startsWith('/auth');
  
  if (isAuthPage) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
            },
          }}
        />
        <Component {...pageProps} />
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
        }}
      />
      <DeliveryLayout>
        <Component {...pageProps} />
      </DeliveryLayout>
    </ThemeProvider>
  );
}

export default MyApp;
