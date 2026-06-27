export default async function handler(req, res) {
  const VERIFY_TOKEN = "ritesh-whatsapp-verify";
  const N8N_WEBHOOK =
    "https://ritesh24.app.n8n.cloud/webhook/whatsapp-documents";

  // ===========================
  // META WEBHOOK VERIFICATION
  // ===========================
  if (req.method === "GET") {
    const mode = req.query["hub.mode"];
    const token = req.query["hub.verify_token"];
    const challenge = req.query["hub.challenge"];

    if (mode === "subscribe" && token === VERIFY_TOKEN) {
      return res.status(200).send(challenge);
    }

    return res.status(403).send("Verification failed");
  }

  // ===========================
  // RECEIVE REAL WHATSAPP EVENTS
  // ===========================
  if (req.method === "POST") {
    try {
      console.log("Incoming WhatsApp payload:");
      console.log(JSON.stringify(req.body, null, 2));

      const payload = {
        source: "vercel",
        receivedAt: new Date().toISOString(),
        whatsapp: req.body,
      };

      const response = await fetch(N8N_WEBHOOK, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const responseText = await response.text();

      console.log("n8n Response:", response.status, responseText);

      // Meta requires HTTP 200
      return res.status(200).send("EVENT_RECEIVED");
    } catch (error) {
      console.error(error);

      // Always return 200 to Meta
      return res.status(200).send("EVENT_RECEIVED");
    }
  }

  return res.status(405).send("Method Not Allowed");
}
