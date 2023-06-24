const asyncHandler = require("express-async-handler");
const User = require("../models/userModel");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const generateToken = (id) => {
    return jwt.sign({id}, process.env.JWT_SECRET, {expiresIn: "1d"});
};

//register user
const registerUser = asyncHandler(async(req, res) => {
    const {name, email, password} = req.body

    //validation
    if(!name || !email || !password){
        res.status(400);
        throw new Error("Please fill in all required fields");
    }

    if(password.lenght < 6){
        res.status(400);
        throw new Error("password must be up to 6 charecters");
    }

    //check if user email already exist

   const userExist = await User.findOne({email})

   if(userExist){
    res.status(400);
    throw new Error("Email has already been registered");
   }

   //create a new user
   const user = await User.create({
    name,
    email,
    password,
   });

   
   //Generate Token
   const token =generateToken(user._id)

   //send HTTP-only cookie
   res.cookie("token", token, {
    path: "/",
    httpOnly: true,
    expires: new Date(Date.now()+ 1000*86 ), //1 day
    sameSite: "none",
    secure: true
   });
   

   if(user){
    const {_id, name, email, photo, phone, bio} = user
    res.status(201).json({
        _id, 
        name, 
        email, 
        photo, 
        phone, 
        bio,
        token
    });
   }else{
    res.status(400);
    throw new Error("Invalid user data");
   }
});

//login user
const loginUser = asyncHandler(async (req, res) => {
    //res.send("Login user");
    const {email, password} = req.body

    //validate request
    if(!email || !password){
        res.status(400);
        throw new Error("Please add email and password");
    }

    //check if user exist
    const user = await User.findOne({email})
    if(!user){
        res.status(400);
        throw new Error("User not found, please sign up");
    }

    // user exist, check if the password is correct
    const pwdCorrect = await bcrypt.compare(password, user.password);
       
   //Generate Token
   const token =generateToken(user._id)

   //send HTTP-only cookie
   res.cookie("token", token, {
    path: "/",
    httpOnly: true,
    expires: new Date(Date.now()+ 1000*86400 ), //1 day
    sameSite: "none",
    secure: true
   });

    if(user && pwdCorrect){
        const {_id, name, email, photo, phone, bio} = user;
        res.status(200).json({
        _id, 
        name, 
        email, 
        photo, 
        phone, 
        bio,
        token,
    });
    }else{
        res.status(400);
        throw new Error("Invalid email or password");
    }
});

// logout user 
const logout = asyncHandler(async (req, res) => {
    res.cookie("token", "", {
        path: "/",
        httpOnly: true,
        expires: new Date(0), //1 day
        sameSite: "none",
        secure: true
       });
       return res.status(200).json({message: "successfully logged out"});
});

//get user profile (userdata)
const getUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id)

    if(user){
        const {_id, name, email, photo, phone, bio} = user
        res.status(200).json({
            _id, 
            name, 
            email, 
            photo, 
            phone, 
            bio,
        });
       }else{
        res.status(400);
        throw new Error("User not found");
       }
});

//Get Login status
const loginStatus= asyncHandler(async (req, res) => {
    const token = req.cookies.token;
    if(!token){
        return res.json(false)
    }
    //verify Token
    const verified = jwt.verify(token, process.env.JWT_SECRET)
    if(verified){
        return res.json(true)
    }
    return res.json(false);
});

//Update User
const updateUser = asyncHandler (async (req, res) => {
    //res.send("User updated");
    const user = await User.findById(req.user._id);
    if(user){
        const{name, email, photo, phone, bio} = user;
        user.email = email;
        user.name = req.body.name || name;
        user.phone = req.body.phone || phone;
        user.bio = req.body.bio || bio;
        user.photo = req.body.photo || photo;

        const updateuser = await user.save();
        res.status(200).json({
            _id: updateuser._id ,
            name: updateuser.name,
            email: updateuser.email,
            photo: updateuser.photo ,
            phone: updateuser.phone ,
            bio: updateuser.bio,
        });
    }else{
        res.status(404);
        throw new Error("User not found");
    }
});

const changepwd = asyncHandler (async (req, res) =>{
    //res.send("pasword changed");
    const user = await User.findById(req.user._id);

    const{oldPassword, password} = req.body;
    if(!user){
        res.status(400);
        throw new Error("User not found, please sign up");
    }

    //check if password is correct in the DB
    const pwdCorrect = await bcrypt.compare(oldPassword, user.password);

    //Save new password
    if(user && pwdCorrect){
        user.password = password;
        await user.save();
        res.status(200).send("Password changed successful");
    }else{
        res.status(400);
        throw new Error("User not found, please sign up");
    }
    //validate

    if(!oldPassword || !password){
        res.status(400);
        throw new Error("Old password is incorrect");
    }
});

module.exports = {
    registerUser,
    loginUser,
    logout,
    getUser,
    loginStatus,
    updateUser,
    changepwd,
}