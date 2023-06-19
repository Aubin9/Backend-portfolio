const dotenv = require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongodb = require("mongodb");
const mongoose = require("mongoose");
const nodemon = require("nodemon");
const userRoute = require("./routes/userRoute");
const errorHandler = require("./middleWare/errorMiddleWare")


const app = express();

const PORT = process.env.PORT || 5000;

//Middlewares
app.use(express.json())
app.use(express.urlencoded({extended: false}))

// Routes Middleware
app.use("/api/users", userRoute);

// Error Middleware
app.use(errorHandler);


//Routes
app.get("/", (req, res) => {
    res.send("You are at the Home page buddy !! <br/> PS: De_Threat");
})

//CONNECT TO mongoDB AND START SERVER
mongoose
        .connect(process.env.MONGO_URI)
        .then(()=>{
            app.listen(PORT, () => {
                console.log(`Server running on port ${PORT}`);
            });
        })
        .catch((err)=> console.log(err));