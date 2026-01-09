import {onCall, HttpsError} from "firebase-functions/v2/https";
import * as admin from "firebase-admin";
import fetch from "node-fetch";
import * as dotenv from "dotenv";

// Initialize Firebase Admin and load environment variables
admin.initializeApp();
dotenv.config();

// Constants for daily limits
const DAILY_LIMIT: Record<string, number> = {
  free: 50,
  pro: 500,
  premium: 1000,
};

// OpenAI API proxy function
export const openaiProxy = onCall(async (request) => {
  // Authentication check
  if (!request.auth) {
    throw new HttpsError(
      "unauthenticated",
      "User must be logged in",
    );
  }

  try {
    // Get user subscription type
    const userDoc = await admin.firestore()
      .collection("users")
      .doc(request.auth.uid)
      .get();

    const subscriptionType = userDoc.data()?.subscriptionType || "free";
    
    // Get today's usage
    const today = new Date().toISOString().split("T")[0];
    const usageDoc = await admin.firestore()
      .collection("daily_usage")
      .doc(`${request.auth.uid}_${today}`)
      .get();

    const currentUsage = usageDoc.data()?.aiMessages || 0;
    const limit = DAILY_LIMIT[subscriptionType as keyof typeof DAILY_LIMIT];

    // Check usage limit
    if (currentUsage >= limit) {
      throw new HttpsError(
        "resource-exhausted",
        "Daily AI message limit reached",
      );
    }

    // Make request to OpenAI
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4",
        messages: request.data.messages,
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const result = await response.json();

    // Increment usage counter
    await admin.firestore()
      .collection("daily_usage")
      .doc(`${request.auth.uid}_${today}`)
      .set({
        userId: request.auth.uid,
        date: today,
        aiMessages: admin.firestore.FieldValue.increment(1),
      }, {merge: true});

    return result;

  } catch (error) {
    console.error("OpenAI proxy error:", error);
    throw new HttpsError(
      "internal",
      "Failed to process request",
    );
  }
});