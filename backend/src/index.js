require('dotenv').config();
const app = require('./app');
const logger = require('./utils/logger');

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
  logger.info(`Server listening on port ${PORT}`);
});
