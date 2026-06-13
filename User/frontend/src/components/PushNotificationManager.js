import { useEffect } from "react";
import { Capacitor } from "@capacitor/core";
import { useAuth } from "../contexts/AuthContext";
import pushNotificationService from "../services/pushNotificationService";
import notificationService from "../services/notificationService";

/**
 * Registers FCM after login when user has push enabled in preferences.
 * Does not show permission dialog until user enables push in Profile.
 */
export default function PushNotificationManager() {
  const { user } = useAuth();
  const isAuthenticated = Boolean(user);

  useEffect(() => {
    if (!isAuthenticated || !Capacitor.isNativePlatform()) return;

    let cancelled = false;

    (async () => {
      try {
        const settings = await notificationService.getNotificationSettings();
        const pushOn = settings?.push ?? settings?.data?.push;
        if (cancelled) return;

        if (pushOn) {
          await pushNotificationService.enablePush();
        } else {
          await pushNotificationService.resumeAfterLogin();
        }
      } catch (err) {
        console.warn("Push setup skipped:", err.message);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, user?.id]);

  return null;
}
