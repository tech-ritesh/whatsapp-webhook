export default async function handler(req, res) {
  const VERIFY_TOKEN = "ritesh-whatsapp-verify";

  // ===========================
  // META VERIFICATION
  // ===========================
  if (req.method === "GET") {
    const mode = req.query["hub.mode"];
    const token = req.query["hub.verify_token"];
    const challenge = req.query["hub.challenge"];

    if (mode === "subscribe" && token === VERIFY_TOKEN) {
      return res.status(200).send(challenge);
    }

    // For browser testing
    return res.status(200).send("Webhook is running");
  }

  // ===========================
  // TEST PAYLOAD
  // ===========================
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

      const response = await fetch(
        "https://ritesh24.app.n8n.cloud/webhook-test/whatsapp-documents",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(payload)
        }
      );

      const text = await response.text();

      return res.status(200).json({
        success: true,
        n8nStatus: response.status,
        n8nResponse: text
      });

    } catch (error) {
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  return res.status(405).send("Method Not Allowed");
}
