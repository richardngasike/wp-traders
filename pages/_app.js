import '../styles/globals.css';
import '../styles/splash.css';
import '../styles/login.css';
import '../styles/layout.css';

import { useState, useEffect } from 'react';
import Head from 'next/head';
import { AuthProvider } from '../context/AuthContext';
import SplashScreen from '../components/SplashScreen';

export default function MyApp({ Component, pageProps }) {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setShowSplash(false), 1300);
    return () => clearTimeout(t);
  }, []);

  return (
    <AuthProvider>
      <Head>
        <title>W&amp;P Grains Traders — Cereal Records System</title>
        <meta
          name="description"
          content="W&P Grains Traders daily cereal records, sales, expenses and profit tracking system."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        <link rel="icon" href="/logo.png" />
      </Head>
      {showSplash && <SplashScreen minDuration={1300} />}
      <Component {...pageProps} />
    </AuthProvider>
  );
}
