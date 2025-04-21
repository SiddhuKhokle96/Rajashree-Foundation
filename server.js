require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

const app = express();

// Middleware - These should come before route definitions
app.use(bodyParser.json());
app.use(cors());

// Database connection
const { sequelize } = require('./config/database');

// Test DB connection
sequelize.authenticate()
  .then(() => console.log('Database connected...'))
  .catch(err => console.log('Error: ' + err));

// Import models to sync with database
require('./models');

// Route imports
const authRoutes = require('./routes/auth');
const beneficiaryRoutes = require('./routes/beneficiaries');
const donationRoutes = require('./routes/donations');
const eventRoutes = require('./routes/events');
const volunteerRoutes = require('./routes/volunteers');
const reportRoutes = require('./routes/reports');

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/beneficiaries', beneficiaryRoutes);
app.use('/api/donations', donationRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/volunteers', volunteerRoutes);
app.use('/api/reports', reportRoutes);

// Sync database
sequelize.sync()
  .then(() => console.log('Database synced'))
  .catch(err => console.log('Error syncing database: ' + err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));