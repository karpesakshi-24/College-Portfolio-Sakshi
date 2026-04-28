const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const nodemailer = require('nodemailer');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// ── Middleware ──
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3001',
  optionsSuccessStatus: 200
}));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

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

// ── Email Transporter ──
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// ── POST /api/contact ──
app.post('/api/contact', async (req, res) => {
  try {
    const { name, email, message } = req.body;
    if (!name || !email || !message)
      return res.status(400).json({ success: false, error: 'All fields are required.' });
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      return res.status(400).json({ success: false, error: 'Invalid email address.' });
    if (message.length < 10)
      return res.status(400).json({ success: false, error: 'Message too short.' });

    const contact = new Contact({ name, email, message });
    await contact.save();

    await transporter.sendMail({
      from: `"Portfolio Contact" <${process.env.EMAIL_USER}>`,
      to: 'karpes603@gmail.com',
      subject: `📬 New message from ${name}`,
      html: `<h2>New Portfolio Message</h2>
             <p><strong>Name:</strong> ${name}</p>
             <p><strong>Email:</strong> ${email}</p>
             <p><strong>Message:</strong> ${message}</p>`
    });

    return res.status(200).json({ success: true, message: 'Message sent successfully!' });
  } catch (err) {
    console.error('Contact error:', err);
    return res.status(500).json({ success: false, error: 'Server error. Please try again.' });
  }
});

// ── GET /api/messages ──
app.get('/api/messages', async (req, res) => {
  const messages = await Contact.find().sort({ createdAt: -1 });
  res.json(messages);
});

// ── Serve frontend ──
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));

app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));