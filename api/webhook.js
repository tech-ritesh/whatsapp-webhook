export default async function handler(req, res) {
  const VERIFY_TOKEN = "ritesh-whatsapp-verify";
  const N8N_WEBHOOK =
    "https://ritesh24.app.n8n.cloud/webhook/whatsapp-documents";

  // ======================================
  // META WEBHOOK VERIFICATION
  // ======================================
  if (req.method === "GET") {
    const mode = req.query["hub.mode"];
    const token = req.query["hub.verify_token"];
    const challenge = req.query["hub.challenge"];

    console.log("========== META VERIFICATION ==========");
    console.log(req.query);

    if (mode === "subscribe" && token === VERIFY_TOKEN) {
      console.log("Webhook verified successfully.");
      return res.status(200).send(challenge);
    }

    console.log("Verification failed.");
    return res.status(403).send("Verification failed");
  }

  // ======================================
  // RECEIVE WHATSAPP EVENT
  // ======================================
  if (req.method === "POST") {
    try {
      console.log("========== WHATSAPP EVENT ==========");
      console.log(JSON.stringify(req.body, null, 2));

      // Payload sent to n8n
      const payload = {
        source: "vercel",
        receivedAt: new Date().toISOString(),
        whatsapp: req.body,
      };

      console.log("========== FORWARDING TO N8N ==========");
      console.log(JSON.stringify(payload, null, 2));

      const response = await fetch(N8N_WEBHOOK, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const responseText = await response.text();

      console.log("========== N8N RESPONSE ==========");
      console.log("Status:", response.status);
      console.log(responseText);

      return res.status(200).send("EVENT_RECEIVED");
    } catch (err) {
      console.error("========== ERROR ==========");
      console.error(err);

      // Always return 200 to Meta
      return res.status(200).send("EVENT_RECEIVED");
    }
  }

  return res.status(405).send("Method Not Allowed");
}
