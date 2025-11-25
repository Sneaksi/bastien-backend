import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import nodemailer from "nodemailer";
import Stripe from "stripe";
import mongoose from "mongoose";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// -------------------------
//  1. CONNECT TO MONGODB
// -------------------------
mongoose
  .connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => console.log("MongoDB connecté ✔"))
  .catch((err) => console.error("Erreur MongoDB ❌", err));

// -------------------------
//  2. STRIPE
// -------------------------
const stripe = new Stripe(process.env.STRIPE_SECRET);

// -------------------------
//  3. MAILJET — SMTP TRANSPORT
// -------------------------
const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,        // in-v3.mailjet.com
  port: Number(process.env.MAIL_PORT), // 587
  secure: false,                      // IMPORTANT → false pour 587
  auth: {
    user: process.env.MAILJET_API_KEY,
    pass: process.env.MAILJET_SECRET_KEY
  },
  tls: {
    rejectUnauthorized: false
  }
});

// -------------------------
//  ROUTE TEST EMAIL
// -------------------------
app.get("/test-email", async (req, res) => {
  try {
    console.log("📨 Tentative d'envoi de mail...");

    const info = await transporter.sendMail({
      from: process.env.MAIL_FROM,
      to: process.env.MAIL_FROM,
      subject: "Test email depuis Render ✔",
      text: "Ton backend envoie des mails parfaitement 😎",
    });

    console.log("Email envoyé :", info);
    res.send("Email envoyé ✔");
  } catch (error) {
    console.error("Erreur d’envoi ❌", error);
    res.status(500).send("Erreur SMTP : " + error.message);
  }
});

// -------------------------
//  ROUTE ACCUEIL
// -------------------------
app.get("/", (req, res) => {
  res.send("Backend en ligne ✔");
});

// -------------------------
//  LANCEMENT SERVEUR
// -------------------------
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Serveur démarré sur ${PORT} ✔`));
