 const express = require('express')
const path = require('path')
const mongoose = require("mongoose");
const app = express()
const session = require('express-session');
const flash = require("connect-flash");
const userRoute = require("./routes/userRoute.js");
const adminRoute = require("./routes/adminRoute.js");
const morgan = require('morgan')


// const server = http.createServer(app);

app.set('views',path.join(__dirname,"views"));

app.use(morgan('dev')); // 'combined' is a predefined log format

app.use(express.json());
app.use(express.urlencoded({extended: true}));

app.set("view engine", 'ejs')
app.use(express.static("public"));

app.use(session({
  secret: 'your-secret-key',
  resave: true,
  saveUninitialized: true
}));

app.use(flash());

// const { log } = require('console');
app.use("/", userRoute)
app.use("/admin", adminRoute)


// Database connection
// mongoose
//     .connect(process.env.MONGODB_URL, { useNewUrlParser: true, useUnifiedTopology: true })
//     .then(() => console.log("DATABASE CONNECTED"))
//     .catch(error => console.error("Error connecting to the database:", error));

// mongoose.connect('mongodb://localhost:27017/TechWiz_Database', { useNewUrlParser: true, useUnifiedTopology: true })


mongoose.connect('mongodb://127.0.0.1:27017/TechWiz_Database')
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((error) => {
    console.error('Error connecting to MongoDB:', error);
  });


const PORT = process.env.PORT || 3000;
app.listen(PORT, ()=> console.log("Server id Running on Port ", PORT))