import "../styles/globals.css";
import Head from "next/head";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { Toaster } from "react-hot-toast";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { Keyboard } from "@capacitor/keyboard";
import { Capacitor } from "@capacitor/core";
import theme from "../theme";
import DeliveryLayout from "../components/DeliveryLayout";
import FloatingRefreshButton from "../components/FloatingRefreshButton";
import PushNotificationManager from "../components/PushNotificationManager";
import { createAxiosInstance } from "../utils/axiosInstance";

function MyApp({ Component, pageProps }) {
  const router = useRouter();
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Initialize the global axios instance with the router for 401 handling
    createAxiosInstance(router);
    setIsInitialized(true);

    // KEYBOARD FIX - Only on native platforms
    if (Capacitor.getPlatform() !== "web") {
      Keyboard.addListener("keyboardWillShow", () => {
        document.body.classList.add("keyboard-open");
      });

      Keyboard.addListener("keyboardWillHide", () => {
        document.body.classList.remove("keyboard-open");
      });
    }

    // AUTH CHECK - Prevent redirect loop
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("deliveryBoyToken");
      const publicRoutes = ["/auth/login", "/auth/register", "/"];

      // Only redirect to login if token is missing AND not already on a public route
      if (!token && !publicRoutes.includes(router.pathname)) {
        router.push("/auth/login");
      }
    }
  }, [router]);

  // Don't show layout for auth pages
  const isAuthPage = router.pathname.startsWith("/auth");

  if (!isInitialized) {
    return null;
  }

  return (
    <>
      <Head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, viewport-fit=cover, user-scalable=no"
        />
      </Head>

      <ThemeProvider theme={theme}>
        <CssBaseline />

        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: "#363636",
              color: "#fff",
            },
          }}
        />

        {isAuthPage ? (
          <Component {...pageProps} />
        ) : (
          <DeliveryLayout>
            <Component {...pageProps} />
          </DeliveryLayout>
        )}

        <FloatingRefreshButton />
        <PushNotificationManager />
      </ThemeProvider>
    </>
  );
}

export default MyApp;
