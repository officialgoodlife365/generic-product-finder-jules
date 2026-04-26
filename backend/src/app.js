const express = require('express');
const app = express();
const routes = require('./routes');

app.use(express.json());

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK' });
});

app.use('/api', routes);

module.exports = app;
