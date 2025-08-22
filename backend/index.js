require('dotenv').config();
require('express-async-errors');


// extra security packages
const helmet=require('helmet');
const cors=require('cors');
const xss=require('xss-clean');
const rateLimiter=require('express-rate-limit');

const connectDB= require('./config/db');
const express = require('express');
const app = express();

const authRouter=require('./routes/auth');
const pdfRouter=require('./routes/pdf');


// error handler
const notFoundMiddleware = require('./middleware/not-found');
const errorHandlerMiddleware = require('./middleware/error-handler');
const authenticationMiddleware=require('./middleware/authentication');

app.set('trust proxy',1);
app.use(
  rateLimiter({
    windowMs:15*60*1000,
    max:100,
  })
);
app.use(express.json());
app.use(express.urlencoded({extended:false}));
app.use(helmet());
app.use(cors());
app.use(xss());

app.use('/api/v1/auth',authRouter);
app.use('/api/v1/pdfs',authenticationMiddleware,pdfRouter);


app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

const port = process.env.PORT || 5000;

const start = async () => {
  try {
    await connectDB(process.env.MONGO_URI);
    console.log("DB connected");
    
    app.listen(port, () =>
      console.log(`Server is listening on port ${port}...`)
    );
  } catch (error) {
    console.log(error);
  }
};

start();
