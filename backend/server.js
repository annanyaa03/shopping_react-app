import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 5000;
const SECRET_KEY = 'super-secret-drip-key-do-not-share';
const DB_FILE = path.join(__dirname, 'users.json');

app.use(cors());
app.use(express.json());

// Helper to read users from JSON file
const readUsers = () => {
  try {
    const data = fs.readFileSync(DB_FILE, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    return [];
  }
};

// Helper to write users to JSON file
const writeUsers = (users) => {
  fs.writeFileSync(DB_FILE, JSON.stringify(users, null, 2), 'utf8');
};

// Ensure users.json exists
if (!fs.existsSync(DB_FILE)) {
  writeUsers([]);
}

// 1. REGISTER ENDPOINT
app.post('/api/register', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required' });
  }

  const users = readUsers();

  // Check if username exists
  if (users.find(u => u.username === username)) {
    return res.status(400).json({ message: 'Username already exists' });
  }

  // Hash password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  // Save new user
  const newUser = {
    id: Date.now().toString(),
    username,
    password: hashedPassword,
    createdAt: new Date().toISOString()
  };

  users.push(newUser);
  writeUsers(users);

  // Generate token
  const token = jwt.sign({ id: newUser.id, username: newUser.username }, SECRET_KEY, { expiresIn: '7d' });

  res.status(201).json({ token, username });
});

// 2. LOGIN ENDPOINT
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required' });
  }

  const users = readUsers();
  const user = users.find(u => u.username === username);

  if (!user) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  // Check password
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  // Generate token
  const token = jwt.sign({ id: user.id, username: user.username }, SECRET_KEY, { expiresIn: '7d' });

  res.status(200).json({ token, username });
});

app.listen(PORT, () => {
  console.log(`[DRIP Backend] Server running on http://localhost:${PORT}`);
  console.log(`[DRIP Backend] Database located at ${DB_FILE}`);
});
