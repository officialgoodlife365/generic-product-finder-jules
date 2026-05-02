const express = require('express');
const cors = require('cors');
const app = express();
const routes = require('./routes');

app.use(cors({
  origin: '*', // We allow all origins for development and local testing
  credentials: true
}));

app.use(express.json());

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK' });
});

app.use('/api', routes);

module.exports = app;
