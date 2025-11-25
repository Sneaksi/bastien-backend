import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import Stripe from "stripe";
import nodemailer from "nodemailer";
import mongoose from "mongoose";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

// ------------------------------
// 1) CONNECTION À MONGODB
// ------------------------------
mongoose
  .connect(process.env.MONGO_URL)
  .then(() => console.log("MongoDB connecté ✔"))
  .catch((err) => console.error("MongoDB erreur ❌", err));

// ------------------------------
// 2) CONFIG EMAIL (GMAIL + mot de passe d'application)
// ------------------------------
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

async function sendEmail({ to, subject, text, html }) {
  return await transporter.sendMail({
    from: `"Boutique Bastien" <${process.env.MAIL_USER}>`,
    to,
    subject,
    text,
    html: html || text,
  });
}

// ------------------------------
// 3) STRIPE
// ------------------------------
const stripe = new Stripe(process.env.STRIPE_SECRET);

// ------------------------------
// 4) ROUTE DE TEST
// ------------------------------
app.get("/", (req, res) => {
  res.send("Backend en ligne ✔");
});

// ➤ TEST EMAIL
app.get("/test-email", async (req, res) => {
  try {
    await sendEmail({
      to: process.env.MAIL_USER,
      subject: "Test email réussi ✔",
      text: "Ton backend Render + Gmail fonctionne parfaitement 🔥",
    });

    res.send("Email envoyé ✔ Vérifie ta boîte Gmail !");
  } catch (err) {
    console.error(err);
    res.status(500).send("Erreur lors de l'envoi de l'email ❌");
  }
});

// ------------------------------
// 5) ROUTE STRIPE (paiement)
// ------------------------------
app.post("/create-checkout-session", async (req, res) => {
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: req.body.items.map((item) => ({
        price_data: {
          currency: "eur",
          product_data: {
            name: item.name,
          },
          unit_amount: item.price * 100,
        },
        quantity: item.quantity,
      })),
      success_url: process.env.SUCCESS_URL,
      cancel_url: process.env.CANCEL_URL,
    });

    res.json({ url: session.url });
  } catch (err) {
    console.error(err);
    res.status(500).send("Erreur Stripe ❌");
  }
});

// ------------------------------
// 6) PORT RENDER
// ------------------------------
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Serveur démarré sur ${PORT} ✔`));
