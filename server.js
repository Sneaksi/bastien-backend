require('dotenv').config();
const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
const mongoose = require('mongoose');

const app = express();
app.use(express.json());
app.use(cors());

// =========================
//  MongoDB Connection
// =========================
mongoose.connect(process.env.MONGO_URL)
  .then(() => console.log("MongoDB connecté ✔"))
  .catch(err => console.error("Erreur MongoDB ❌", err));

// =========================
//  Root Route
// =========================
app.get('/', (req, res) => {
  res.send('Backend en ligne ✔');
});

// =========================
//  Test Email Route
// =========================
app.get('/test-email', async (req, res) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS
      }
    });

    const info = await transporter.sendMail({
      from: `"Bastien Shop" <${process.env.MAIL_USER}>`,
      to: process.env.MAIL_USER,
      subject: "Test Email ✔",
      text: "Ton serveur mail fonctionne parfaitement !",
    });

    res.send("Email envoyé ✔");
  } catch (error) {
    console.error(error);
    res.status(500).send("Erreur lors de l'envoi ❌");
  }
});

// =========================
//  Stripe Checkout Example
// =========================
const Stripe = require("stripe");
const stripe = Stripe(process.env.STRIPE_SECRET);

app.post("/create-checkout-session", async (req, res) => {
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: req.body.items.map(item => ({
        price_data: {
          currency: 'eur',
          product_data: { name: item.name },
          unit_amount: item.price * 100,
        },
        quantity: item.quantity,
      })),
      success_url: process.env.SUCCESS_URL,
      cancel_url: process.env.CANCEL_URL,
    });

    res.json({ url: session.url });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// =========================
//  Port (Render)
// =========================
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`Serveur démarré sur ${PORT} ✔`);
});
