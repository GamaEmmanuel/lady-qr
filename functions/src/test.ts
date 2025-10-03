import { onCall } from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";

export const helloWorld = onCall((request) => {
  logger.info("Hello logs! (v2)", { structuredData: true });
  return { text: "Hello from Firebase!" };
});