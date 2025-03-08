require('dotenv').config();
const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const codeRoutes = require('./routes/codeRoutes');

const app = express();

// Middleware
app.use(express.json());
app.use(cors());
app.use('/auth', authRoutes);
app.use('/codes', codeRoutes);

//Test Route
app.get('/', (req, res) => {
  res.send('Server is running');
});

// start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});