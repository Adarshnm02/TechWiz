require('dotenv').config();
const express = require('express')
const app = express()
const path = require('path')

const mongoose = require("mongoose");
const MongoStore = require('connect-mongo');
const session = require('express-session');
const flash = require("connect-flash");
const morgan = require('morgan')
const { v4: uuidv4 } = require("uuid");
const Razorpay = require('razorpay')

const userRoute = require("./routes/userRoute.js");
const adminRoute = require("./routes/adminRoute.js");


// const server = http.createServer(app);

app.set('views',path.join(__dirname,"views"));

app.use(morgan('dev'));

app.use(express.json());
app.use(express.urlencoded({extended: true}));

app.set("view engine", 'ejs')
app.use(express.static("public"));


app.use(session({
  secret: 'your-secret-key',
  resave: true,
  saveUninitialized: true,
  // store: new MongoStore({
  //   mongoUrl: process.env.MONGO_URL,
  //   collection: 'sessions',
  // }),  
}));





app.use(flash());

mongoose.connect(process.env.MONGO_URL)
.then(() => console.log('DB Connected'))
.catch(err => console.error('Error connecting to MongoDB:', err));

app.use("/", userRoute)
app.use("/admin", adminRoute)
app.all("/*",(req,res)=>res.render("404",{url:req.url}))


const PORT = process.env.PORT;
app.listen(PORT, ()=> console.log("Server id Running on Port ", PORT))


