const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
    name: {
        type: String,
        required: [true, "Please add a name"]
    },
    email:{
        type: String,
        required: [true, "Please add an email"],
        unique: true,
        trim: true,
        match: [
            /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
            , "Please enter a valid email"
        ]   
    },
    password: {
        type: String,
        required: [true, "Please add a password"],
        minLenght: [8, "password must be up to 8 characters"],
       // maxLenght: [20, "password must not be more than 20 characters"]
    },
    bio: {
        type: String,
        maxLenght: [250, "should not be more than 250 characters"],
        default: "bio"
    },
    phone: {
        type: String,
        default: "+237"
    },
    photo: {
        type: String,
        required: [true, "Please add a photo"],
        default: ""
    }
},{
    timestamps: true,
})


const User = mongoose.model("User", userSchema)
module.exports = User