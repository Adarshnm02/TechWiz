const express = require('express')
const path = require('path')

const app = express()
// const server = http.createServer(app);

app.set('views',path.join(__dirname,"views"));

app.use(express.json());
app.use(express.urlencoded({extended: true}));

app.set("view engine", 'ejs')
app.use(express.static("public"));

const userRoute = require("./routes/userRoute.js")
app.use("/", userRoute)

const PORT = process.env.PORT || 3000;
app.listen(PORT, ()=> console.log("Server id Running on Port ", PORT))