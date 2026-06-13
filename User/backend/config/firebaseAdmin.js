const admin = require("firebase-admin");
const fs = require("fs");
const path = require("path");

let initialized = false;

function loadServiceAccount() {
  if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
    return JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
  }

  const filePath =
    process.env.FIREBASE_SERVICE_ACCOUNT_PATH ||
    path.join(__dirname, "firebase-service-account.json");

  if (fs.existsSync(filePath)) {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  }

  return null;
}

function getMessaging() {
  if (initialized) {
    return admin.messaging();
  }

  const serviceAccount = loadServiceAccount();
  if (!serviceAccount) {
    return null;
  }

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: serviceAccount.project_id,
  });
  initialized = true;
  return admin.messaging();
}

function isAdminReady() {
  return Boolean(getMessaging());
}

/** FCM data payload values must be strings */
function stringifyData(data = {}) {
  const out = {};
  Object.entries(data).forEach(([key, value]) => {
    if (value === undefined || value === null) return;
    out[key] = typeof value === "string" ? value : JSON.stringify(value);
  });
  return out;
}

module.exports = { getMessaging, isAdminReady, stringifyData };
