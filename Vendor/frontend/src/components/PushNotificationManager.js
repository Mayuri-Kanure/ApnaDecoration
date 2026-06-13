import { useEffect } from "react";
import { Capacitor } from "@capacitor/core";
import { useAuth } from "../contexts/AuthContext";
import pushNotificationService from "../services/pushNotificationService";

export default function PushNotificationManager() {
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated || !Capacitor.isNativePlatform()) return;

    const enabled = localStorage.getItem("vendorPushEnabled") === "true";
    (async () => {
      try {
        if (enabled) {
          await pushNotificationService.enablePush();
        } else {
          await pushNotificationService.resumeAfterLogin();
        }
      } catch (e) {
        console.warn("Vendor push setup:", e.message);
      }
    })();
  }, [isAuthenticated]);

  return null;
}
