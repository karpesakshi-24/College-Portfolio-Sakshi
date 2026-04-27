// ──────────────────────────────────────────────
//  Sakshi Karpe Portfolio — Contact Form Backend
//  Stack: Node.js + Express + Nodemailer
//  DB: MongoDB (Mongoose) for storing messages
// ──────────────────────────────────────────────

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const nodemailer = require('nodemailer');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// ── Middleware ──
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  optionsSuccessStatus: 200
}));
app.use(express.json());

// Serve frontend static files
app.use(express.static('public'));


// ── MongoDB Connection ──
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/portfolio')
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('MongoDB error:', err));

// ── Contact Message Schema ──
const contactSchema = new mongoose.Schema({
  name:      { type: String, required: true, trim: true },
  email:     { type: String, required: true, trim: true, lowercase: true },
  message:   { type: String, required: true, trim: true },
  createdAt: { type: Date, default: Date.now },
  read:      { type: Boolean, default: false }
});
const Contact = mongoose.model('Contact', contactSchema);

// ── Email Transporter (Gmail) ──
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,   // your Gmail: karpes603@gmail.com
    pass: process.env.EMAIL_PASS    // App Password (not your Gmail password)
  }
});

// ── POST /api/contact ──
app.post('/api/contact', async (req, res) => {
  try {
    const { name, email, message } = req.body;

    // Validate
    if (!name || !email || !message) {
      return res.status(400).json({ success: false, error: 'All fields are required.' });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ success: false, error: 'Invalid email address.' });
    }
    if (message.length < 10) {
      return res.status(400).json({ success: false, error: 'Message too short.' });
    }

    // Save to MongoDB
    const contact = new Contact({ name, email, message });
    await contact.save();

    // Send email notification to Sakshi
    await transporter.sendMail({
      from: `"Portfolio Contact" <${process.env.EMAIL_USER}>`,
      to: 'karpes603@gmail.com',
      subject: `📬 New message from ${name}`,
      html: `
        <h2>New Portfolio Message</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
        <p><strong>Message:</strong></p>
        <blockquote style="border-left:3px solid #3b82f6;padding-left:12px;color:#555">${message}</blockquote>
        <hr/>
        <small>Sent from your portfolio contact form</small>
      `
    });

    // Auto-reply to sender
    await transporter.sendMail({
      from: `"Sakshi Karpe" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Thanks for reaching out! 👋',
      html: `
        <p>Hi ${name},</p>
        <p>Thanks for reaching out! I've received your message and will get back to you soon.</p>
        <p>– Sakshi Karpe</p>
      `
    });

    return res.status(200).json({ success: true, message: 'Message sent successfully!' });
  } catch (err) {
    console.error('Contact error:', err);
    return res.status(500).json({ success: false, error: 'Server error. Please try again.' });
  }
});

// ── GET /api/messages (admin — protect this in production!) ──
app.get('/api/messages', async (req, res) => {
  // TODO: Add auth middleware before deploying
  const messages = await Contact.find().sort({ createdAt: -1 });
  res.json(messages);
});

// ── Health check ──
app.get('/', (req, res) => res.json({ status: 'ok', service: 'Sakshi Portfolio Backend' }));

app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
