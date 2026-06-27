export default async function handler(req, res) {
  const VERIFY_TOKEN = "ritesh-whatsapp-verify";

  // During testing, point to the TEST webhook
  const N8N_WEBHOOK =
    "https://ritesh24.app.n8n.cloud/webhook-test/whatsapp-documents";

  // ============================================
  // META WEBHOOK VERIFICATION
  // ============================================
  if (req.method === "GET") {
    const mode = req.query["hub.mode"];
    const token = req.query["hub.verify_token"];
    const challenge = req.query["hub.challenge"];

    if (mode === "subscribe" && token === VERIFY_TOKEN) {
      return res.status(200).send(challenge);
    }

    return res.status(403).send("Verification failed");
  }

  // ============================================
  // DEVELOPMENT MODE (FAKE WHATSAPP PAYLOAD)
  // ============================================
  if (req.method === "POST") {
    try {

      const payload = {
        source: "vercel",
        receivedAt: new Date().toISOString(),

        whatsapp: {
          entry: [
            {
              changes: [
                {
                  value: {
                    messages: [
                      {
                        from: "919999999999",
                        type: "document",
                        document: {
                          id: "MEDIA123456",
                          filename: "invoice.pdf",
                          mime_type: "application/pdf"
                        }
                      }
                    ]
                  }
                }
              ]
            }
          ]
        }
      };

      console.log("Forwarding fake payload to n8n...");
      console.log(JSON.stringify(payload, null, 2));

      const response = await fetch(N8N_WEBHOOK, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      const text = await response.text();

      console.log("n8n Status:", response.status);
      console.log("n8n Response:", text);

      return res.status(200).send("EVENT_RECEIVED");

    } catch (err) {
      console.error(err);
      return res.status(500).send("Error");
    }
  }

  return res.status(405).send("Method Not Allowed");
}
