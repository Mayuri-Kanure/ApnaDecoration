import { useEffect } from "react";
import { Capacitor } from "@capacitor/core";
import pushNotificationService from "../utils/pushNotificationService";

export default function PushNotificationManager() {
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;
    if (!localStorage.getItem("deliveryBoyToken")) return;

    const enabled = localStorage.getItem("deliveryPushEnabled") === "true";
    (async () => {
      try {
        if (enabled) {
          await pushNotificationService.enablePush();
        } else {
          await pushNotificationService.resumeAfterLogin();
        }
      } catch (e) {
        console.warn("Delivery push setup:", e.message);
      }
    })();
  }, []);

  return null;
}
