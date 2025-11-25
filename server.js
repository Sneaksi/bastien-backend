import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import nodemailer from "nodemailer";
import Stripe from "stripe";

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

// -----------------------------
// 🔗 CONNECT MONGODB
// -----------------------------
mongoose
  .connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => console.log("MongoDB connecté ✔"))
  .catch((err) => console.error("Erreur MongoDB:", err));

// -----------------------------
// 💳 STRIPE
// -----------------------------
const stripe = new Stripe(process.env.STRIPE_SECRET);

// -----------------------------
// 📧 MAILJET SMTP (Nodemailer)
// -----------------------------
const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST, // in-v3.mailjet.com
  port: Number(process.env.MAIL_PORT), // 587
  secure: false,
  auth: {
    user: process.env.MAIL_USER,  // API Key
    pass: process.env.MAIL_PASS   // Secret Key
  }
});

// Route test email
app.get("/test-email", async (req, res) => {
  try {
    await transporter.sendMail({
      from: process.env.MAIL_FROM, // ton mail gmail
      to: process.env.MAIL_FROM,   // tu te l’envoies à toi
      subject: "Test Mailjet ✔",
      text: "Félicitations Bastien, ton backend envoie des emails ! 🎉"
    });

    res.send("Email envoyé !");
  } catch (err) {
    console.error(err);
    res.status(500).send("Erreur email :" + err.message);
  }
});

// -----------------------------
// 🏠 HOME
// -----------------------------
app.get("/", (req, res) => {
  res.send("Backend en ligne ✔");
});

// -----------------------------
// 🚀 START SERVER
// -----------------------------
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`Serveur démarré sur ${PORT} ✔`);
});
