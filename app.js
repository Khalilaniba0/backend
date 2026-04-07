var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var cors = require('cors');
const axios = require('axios');

const http = require('http');
const { connectToMongoDB } = require('./config/db');
const utilisateurRouter = require('./routes/utilisateur.route');
const offreEmploiRouter = require('./routes/offreEmploi.route');
const candidatureRouter = require('./routes/candidature.route');
const entretienRouter = require('./routes/entretien.route');
const entrepriseRouter = require('./routes/entreprise.route');
const candidatRouter = require('./routes/candidat.route');
const notificationRouter = require('./routes/notification.route');
const googleRouter = require('./routes/google.route');
const { startNotificationCron } = require('./notificationCron');

require('dotenv').config();
var app = express();

const IA_BASE_URL = process.env.IA_BASE_URL || 'http://127.0.0.1:8000';
const IA_HEALTH_TIMEOUT_MS = Number(process.env.IA_HEALTH_TIMEOUT_MS || 5000);

const checkIaHealth = async () => {
  try {
    const response = await axios.get(`${IA_BASE_URL}/health`, {
      timeout: IA_HEALTH_TIMEOUT_MS
    });
    console.log(`[IA] health check OK (${response.status})`);
  } catch (error) {
    console.warn('[IA] health check KO', {
      baseUrl: IA_BASE_URL,
      status: error?.response?.status || null,
      message: error.message,
      details: error?.response?.data || null
    });
  }
};

// Enable CORS for local frontend running on http://localhost:3000
const corsOptions = {
  origin: 'http://localhost:3000',
  credentials: true,
};
app.use(cors(corsOptions));

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/user', utilisateurRouter);
app.use('/offre', offreEmploiRouter);
app.use('/candidature', candidatureRouter);
app.use('/entretien', entretienRouter);
app.use('/entreprise', entrepriseRouter);
app.use('/candidat', candidatRouter);
app.use('/notification', notificationRouter);
app.use('/', googleRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  const status = err.status || 500;
  res.status(status).json({
    message: err.message,
    error: req.app.get('env') === 'development' ? err : {}
  });
});

const server = http.createServer(app);
server.listen(process.env.PORT, () => {
  connectToMongoDB();
  if (process.env.NODE_ENV !== 'test') {
    startNotificationCron();
    checkIaHealth();
  }
  console.log(`Server is running on port ${process.env.PORT}`);
});
