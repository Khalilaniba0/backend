var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var cors = require('cors');

const http = require('http');
const { connectToMongoDB } = require('./config/db');
const utilisateurRouter = require('./routes/utilisateur.route');
const offreEmploiRouter = require('./routes/offreEmploi.route');
const candidatureRouter = require('./routes/candidature.route');
const entretienRouter = require('./routes/entretien.route');
const entrepriseRouter = require('./routes/entreprise.route');
const candidatRouter = require('./routes/candidat.route');

require('dotenv').config();
var app = express();

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
app.use('/condidature', candidatureRouter);
app.use('/entretien', entretienRouter);
app.use('/entreprise', entrepriseRouter);
app.use('/candidat', candidatRouter);

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
  console.log(`Server is running on port ${process.env.PORT}`);
});
