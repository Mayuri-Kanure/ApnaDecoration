import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    // Check if logged in
    const token = localStorage.getItem('deliveryBoyToken');
    if (token) {
      router.push('/dashboard');
    } else {
      router.push('/auth/login');
    }
  }, [router]);

  return (
    <>
      <Head>
        <title>APNA Decoration - Delivery Boy Portal</title>
        <meta name="description" content="APNA Decoration Delivery Boy Management System" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        background: 'linear-gradient(135deg, #1e3a5f 0%, #2d5a8c 100%)'
      }}>
        <div style={{ textAlign: 'center', color: 'white' }}>
          <h1>APNA Decoration</h1>
          <h2>Delivery Boy Portal</h2>
          <p>Redirecting...</p>
        </div>
      </div>
    </>
  );
}

