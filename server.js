const express = require('express');
const path = require('path');
const session = require('express-session');
const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
const fs = require('fs');
const nodemailer = require('nodemailer');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;

const bodyParser = require('body-parser');

const marked = require('marked');
const cors = require('cors');
const app = express();


const signupOtpStore = new Map(); // OTP store for signup verification
const otpStore = new Map();
const PORT = process.env.PORT || 3000; // Use the port provided by Render

app.use(cors({
  origin: 'https://lumthrong.github.io',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'docs')));

// MySQL connection pool
// Adjust paths to your Aiven SSL certs or use environment variables
const pool = mysql.createPool({
  host: 'mysql25-iamrein22-b134.l.aivencloud.com',
  user: 'avnadmin',
  password: 'AVNS_9fI-t0cKjZwHMs8wk-f',
  database: 'school',
  port: 24234,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  ssl: {
    ca: fs.readFileSync(path.join(__dirname, 'certs', 'ca.pem'))
  }
});

console.log('Connected to MySQL database.');

// Session config
app.set('trust proxy', 1); // Important for secure cookies on Render

app.use(session({
  secret: 'secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 86400000,    // 24 hours
    secure: true,        // must be true on HTTPS (Render is HTTPS)
    sameSite: 'None',    // required for cross-site cookie sharing
    httpOnly: true
  }
}));
// Passport setup for Google OAuth
app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((obj, done) => done(null, obj));

passport.use(new GoogleStrategy({
  clientID: '190509381347-a7i2jlg299jftg17upf55q1f61a4l9nq.apps.googleusercontent.com',
  clientSecret: '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',
  callbackURL: '/auth/google/callback'
}, async (accessToken, refreshToken, profile, done) => {
  const email = profile.emails[0].value;
  try {
    const [rows] = await pool.query('SELECT id FROM users WHERE username = ?', [email]);
    if (rows.length === 0) {
      await pool.query('INSERT INTO users (username, password, auth_provider) VALUES (?, ?, ?)', [
        email,
        '', // no password for google users
        'google'
      ]);
    }
    return done(null, { username: email });
  } catch (err) {
    return done(err, null);
  }
}));
// Helpers for username validation
function isValidIdentifier(value) {
  const gmailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
  const phoneRegex = /^\d{10}$/;
  return gmailRegex.test(value) || phoneRegex.test(value);
}

// Nodemailer transporter setup
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'iamrein22@gmail.com',
    pass: 'ljtanxotdoizurbh'
  }
});
//ContactUs Section
app.post('/contact', express.json(), async (req, res) => {
  const { name, email, phone, subject, message } = req.body;

  if (!name || !email || !phone || !subject || !message) {
    return res.status(400).json({ message: "All fields are required." });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phoneRegex = /^[0-9]{10}$/;

  if (!emailRegex.test(email)) {
    return res.status(400).json({ message: "Invalid email format." });
  }

  if (!phoneRegex.test(phone)) {
    return res.status(400).json({ message: "Invalid phone number. Must be 10 digits." });
  }

  const mailOptions = {
    from: `"${name}" <${email}>`,
    to: 'iamrein22@gmail.com',
    subject: `Contact Form: ${subject}`,
    text: `From: ${name}\nEmail: ${email}\nPhone: ${phone}\nSubject: ${subject}\n\n${message}`
  };

  try {
    await transporter.sendMail(mailOptions);
    res.json({ message: "Thanks for contacting us! We'll respond soon." });
  } catch (error) {
    console.error('Email sending failed:', error);
    res.status(500).json({ message: "Failed to send message. Please try again later." });
  }
});
// Send OTP route for password recovery
app.post('/send-otp', async (req, res) => {
  const { email } = req.body;
  if (!email || !email.endsWith('@gmail.com')) {
    return res.status(400).json({ success: false, message: 'Invalid Gmail address' });
  }

  try {
    const [rows] = await pool.query('SELECT id FROM users WHERE username = ?', [email]);
    if (rows.length === 0) {
      return res.status(400).json({ success: false, message: 'Email not registered' });
    }

    const now = Date.now();
    const existing = otpStore.get(email);
    if (existing && now - existing.lastSent < 60000) { // 1 min cooldown
      return res.status(429).json({ success: false, message: 'Wait before resending OTP' });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    otpStore.set(email, { otp, expires: now + 10 * 60 * 1000, lastSent: now }); // 10 min expiry

    await transporter.sendMail({
      from: '"LFHS.Edu" <iamrein22@gmail.com>',
      to: email,
      subject: 'Password Reset OTP',
      text: `Your OTP is ${otp}. It expires in 10 minutes.`
    });

    res.json({ success: true });
  } catch (err) {
    console.error('Send OTP error:', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Verify OTP and set new password
app.post('/verify-otp', async (req, res) => {
  const { email, otp, newPassword } = req.body;

  if (typeof newPassword !== 'string' || newPassword.length < 8) {
    return res.status(400).json({ success: false, message: 'New password must be at least 8 characters' });
  }

  const record = otpStore.get(email);
  if (!record) {
    return res.status(400).json({ success: false, message: 'OTP not found or expired' });
  }
  if (record.expires < Date.now()) {
    otpStore.delete(email);
    return res.status(400).json({ success: false, message: 'OTP expired' });
  }
  if (record.otp !== otp) {
    return res.status(400).json({ success: false, message: 'Invalid OTP' });
  }

  try {
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await pool.query('UPDATE users SET password = ? WHERE username = ?', [hashedPassword, email]);
    otpStore.delete(email);
    res.json({ success: true });
  } catch (err) {
    console.error('Verify OTP error:', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// ========== SIGNUP VERIFICATION FLOW ==========

// 1. Request OTP for signup (send OTP to email or phone)
app.post('/request-signup-otp', async (req, res) => {
  const { username } = req.body;

  if (!isValidIdentifier(username)) {
    return res.status(400).json({ message: 'Username must be a valid Gmail or 10-digit phone number' });
  }

  try {
    // Check if user already exists
    const [rows] = await pool.query('SELECT auth_provider FROM users WHERE username = ?', [username]);
    if (rows.length > 0) {
      if (rows[0].auth_provider === 'google') {
        return res.status(409).json({ message: 'Google account already registered. Please use Google Sign-In.' });
      }
      return res.status(409).json({ message: 'Username already exists' });
    }

    // Rate limit OTP sending (1 min cooldown)
    const now = Date.now();
    const existing = signupOtpStore.get(username);
    if (existing && now - existing.lastSent < 60000) {
      return res.status(429).json({ message: 'Please wait before requesting another OTP' });
    }

    // Generate OTP and store it with expiry (10 min)
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    signupOtpStore.set(username, { otp, expires: now + 10 * 60 * 1000, lastSent: now });

    // Send OTP email if Gmail address
    if (username.endsWith('@gmail.com')) {
      await transporter.sendMail({
        from: '"LFHSSOfficial" <iamrein22@gmail.com>',
        to: username,
        subject: 'Signup Verification OTP',
        text: `Your 6-digit Code for signup verification is ${otp}. It expires in 10 minutes.`
      });
    }
    // If phone number, integrate SMS sending logic here

    res.json({ message: '6-digit Code sent for signup verification' });
  } catch (err) {
    console.error('Request signup OTP error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// 2. Verify OTP and create user
app.post('/verify-signup-otp', async (req, res) => {
  const { username, otp, password } = req.body;

  if (!isValidIdentifier(username)) {
    return res.status(400).json({ message: 'Invalid username format' });
  }
  if (typeof password !== 'string' || password.length < 8) {
    return res.status(400).json({ message: 'Password must be at least 8 characters' });
  }

  const record = signupOtpStore.get(username);
  if (!record) {
    return res.status(400).json({ message: '6-digit Code not found or expired' });
  }
  if (record.expires < Date.now()) {
    signupOtpStore.delete(username);
    return res.status(400).json({ message: 'Code expired' });
  }
  if (record.otp !== otp) {
    return res.status(400).json({ message: 'Invalid 6-digit Code' });
  }

  try {
    // Double check user doesn't exist before creating
    const [rows] = await pool.query('SELECT id FROM users WHERE username = ?', [username]);
    if (rows.length > 0) {
      signupOtpStore.delete(username);
      return res.status(409).json({ message: 'Username already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await pool.query(
      'INSERT INTO users (username, password, auth_provider) VALUES (?, ?, ?)',
      [username, hashedPassword, 'local']
    );

    signupOtpStore.delete(username);
    res.json({ message: 'Signup successful' });
  } catch (err) {
    console.error('Verify signup OTP error:', err);
    res.status(500).json({ message: 'Database error during signup' });
  }
});

// ========== LOGIN (local) ==========
app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  if (!isValidIdentifier(username)) {
    return res.status(400).json({ message: 'Invalid username format' });
  }

  try {
    const [rows] = await pool.query('SELECT id, password, auth_provider FROM users WHERE username = ?', [username]);
    if (rows.length === 0) {
      return res.status(401).json({ message: 'Username or password error' });
    }

    const user = rows[0];

    if (user.auth_provider === 'google') {
      return res.status(403).json({ message: 'Please use Google Sign-In for this account.' });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ message: 'Username or password error' });
    }

    req.session.user = { username, id: user.id };
    res.json({ message: 'Login successful' });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Database error during login' });
  }
});

// ========== LOGOUT ==========
app.post('/logout', (req, res) => {
  req.session.destroy(() => {
    res.clearCookie('connect.sid');
    res.json({ message: 'Logged out' });
  });
});

// ========== PASSWORD RESET FLOW ==========
app.post('/reset-password', async (req, res) => {
  const { username, currentPassword, newPassword } = req.body;

  // Basic input validation
  if (!username || !currentPassword || !newPassword) {
    return res.status(400).json({ success: false, message: 'All fields are required' });
  }

  if (typeof newPassword !== 'string' || newPassword.length < 8) {
    return res.status(400).json({ success: false, message: 'New password must be at least 8 characters long' });
  }

  try {
    const [rows] = await pool.query('SELECT password FROM users WHERE username = ?', [username]);

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const user = rows[0];
    const passwordMatch = await bcrypt.compare(currentPassword, user.password);

    if (!passwordMatch) {
      return res.status(401).json({ success: false, message: 'Current password is incorrect' });
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    await pool.query('UPDATE users SET password = ? WHERE username = ?', [hashedNewPassword, username]);

    res.json({ success: true, message: 'Password changed successfully' });

  } catch (err) {
    console.error('Error resetting password with current password:', err);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: err.message, // for debugging; remove in production
    });
  }
});


// ========== GOOGLE OAUTH ==========
app.get('/auth/google', passport.authenticate('google', { scope: ['email', 'profile'] }));

app.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/login.html' }),
  (req, res) => {
    req.session.user = { username: req.user.username };
    res.redirect('/index.html');
  });

// ========== CHECK AUTH STATUS ==========
function requireLogin(req, res, next) {
  if (req.session && req.session.user) {
    next();
  } else {
    res.redirect('/login.html');
  }
}
// Check authentication
app.get('/check-auth', (req, res) => {
  if (req.session.user) {
    res.json({ loggedIn: true, username: req.session.user.username });
  } else {
    res.json({ loggedIn: false });
  }
});
app.get('/docs/:filename', requireLogin, (req, res) => {
  const filePath = path.join(__dirname, 'protected_docs', req.params.filename);

  if (!fs.existsSync(filePath)) {
    return res.status(404).send('File not found');
  }

  res.sendFile(filePath);
});
const protectedPages = ['feedback', 'Alumni', 'staff', 'contact'];
protectedPages.forEach(page => {
  app.get(`/${page}.html`, requireLogin, (req, res) => {
    res.sendFile(path.join(__dirname, 'protected', `${page}.html`));
  });
});

// ========== START SERVER ==========
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
