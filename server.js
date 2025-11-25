import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import Stripe from "stripe";
import mongoose from "mongoose";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// -------------------------
//  MONGO
// -------------------------
mongoose
  .connect(process.env.MONGO_URL)
  .then(() => console.log("MongoDB connecté ✔"))
  .catch((err) => console.error("Erreur MongoDB ❌", err));

// -------------------------
// STRIPE
// -------------------------
const stripe = new Stripe(process.env.STRIPE_SECRET);

// -------------------------
// MAILJET API (pas SMTP !)
// -------------------------
import Mailjet from "node-mailjet";

const mailjet = new Mailjet({
  apiKey: process.env.MAILJET_API_KEY,
  apiSecret: process.env.MAILJET_SECRET_KEY,
});

// -------------------------
//   TEST EMAIL
// -------------------------
app.get("/test-email", async (req, res) => {
  try {
    const response = await mailjet
      .post("send", { version: "v3.1" })
      .request({
        Messages: [
          {
            From: {
              Email: process.env.MAIL_FROM,
              Name: "Boutique Bastien",
            },
            To: [
              {
                Email: process.env.MAIL_FROM,
              },
            ],
            Subject: "Test email via API ✔",
            TextPart: "Ton backend fonctionne ENFIN 😎",
            HTMLPart:
              "<h2>Mail envoyé via Mailjet API depuis Render ✔</h2><p>Tu gères 🔥</p>",
          },
        ],
      });

    console.log("Email envoyé ✔", response.body);

    res.send("Email envoyé via API ✔");
  } catch (error) {
    console.error("Erreur API Mailjet ❌", error);
    res.status(500).send("Erreur API : " + error.message);
  }
});

// -------------------------
app.get("/", (req, res) => {
  res.send("Backend en ligne ✔");
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Serveur démarré sur ${PORT} ✔`));
