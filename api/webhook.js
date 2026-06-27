export default async function handler(req, res) {
  const VERIFY_TOKEN = "ritesh-whatsapp-verify";

  // ==========================
  // META WEBHOOK VERIFICATION
  // ==========================
  if (req.method === "GET") {
    const mode = req.query["hub.mode"];
    const token = req.query["hub.verify_token"];
    const challenge = req.query["hub.challenge"];

    console.log("Verification Request:", req.query);

    if (mode === "subscribe" && token === VERIFY_TOKEN) {
      console.log("Webhook Verified Successfully");
      return res.status(200).send(challenge);
    }

    console.log("Verification Failed");
    return res.status(403).send("Verification failed");
  }

  // ==========================
  // RECEIVE WHATSAPP EVENTS
  // ==========================
  if (req.method === "POST") {
    try {
      console.log(
        "Incoming WhatsApp Event:",
        JSON.stringify(req.body, null, 2)
      );

      const n8nResponse = await fetch(
        "https://ritesh24.app.n8n.cloud/webhook/whatsapp-documents",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(req.body),
        }
      );

      const responseText = await n8nResponse.text();

      console.log("Forwarded to n8n");
      console.log("n8n Status:", n8nResponse.status);
      console.log("n8n Response:", responseText);

      return res.status(200).send("EVENT_RECEIVED");
    } catch (error) {
      console.error("Error forwarding to n8n:", error);

      // Meta expects a 200 so it doesn't keep retrying
      return res.status(200).send("EVENT_RECEIVED");
    }
  }

  return res.status(405).send("Method Not Allowed");
}
