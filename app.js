var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

const http =require('http');
const  { connectToMongoDB } = require('./config/db');
const userRouter = require('./routes/user.route');
const offreEmploiRouter = require('./routes/offreEmploi.route');
const cvRouter = require('./routes/cv.route');
const condidatureRouter = require('./routes/condidature.route');
const entretienRouter = require('./routes/entretien.route');


require('dotenv').config();
var app = express();


app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/user', userRouter);
app.use('/offre', offreEmploiRouter);
app.use('/cv', cvRouter);
app.use('/condidature', condidatureRouter);
app.use('/entretien', entretienRouter);

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
server.listen(process.env.PORT , () => {
  connectToMongoDB();
  console.log(`Server is running on port ${process.env.PORT}`);
}); 