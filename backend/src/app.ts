import 'dotenv/config';
import express from 'express';
import bodyParser from 'body-parser';
import { sequelize, User } from './models';
import jwt from 'jsonwebtoken';

const app = express();
app.use(bodyParser.json());

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

// Register endpoint
app.post('/register', async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already in use' });
    }
    const user = await User.create({ name, email, password } as any);
    res.status(201).json({ id: user.id, name: user.name, email: user.email });
  } catch (err) {
    res.status(500).json({ message: 'Registration failed', error: err });
  }
});

// Login endpoint
app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const valid = await user.validatePassword(password);
    if (!valid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '1h' });
    res.json({ token });
  } catch (err) {
    res.status(500).json({ message: 'Login failed', error: err });
  }
});

// Middleware to authenticate JWT
function authenticateToken(req: any, res: any, next: any) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.sendStatus(401);
  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}

// Me endpoint (protected)
app.get('/me', authenticateToken, async (req: any, res) => {
  try {
    const user = await User.findByPk(req.user.id, { attributes: ['id', 'name', 'email'] });
    if (!user) return res.sendStatus(404);
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch user', error: err });
  }
});

// Sync DB and start server
const PORT = process.env.PORT || 3000;
(async () => {
  await sequelize.sync();
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
})(); 