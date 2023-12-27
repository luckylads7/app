require('dotenv').config();

const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require('mongoose');
const encrypt=require("mongoose-encryption");

const app = express();
const port = 3000;

app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
    extended: true
}));
mongoose.connect("mongodb://localhost:27017/userDB", 
).then(() => console.log('Connected to MongoDB!'));

const userSchema=new mongoose.Schema({
    email:String,
    password:String
});


userSchema.plugin(encrypt,{secret:process.env.SECRET,encryptedFields:["password"]});
const User= new mongoose.model("User",userSchema);
app.get("/", function (req, res) {
    res.render("home.ejs");
});

app.get("/login", function (req, res) {
    res.render("login.ejs");
});

app.get("/register", function (req, res) {
    res.render("register.ejs");
});
app.post("/register",function(req,res){
    const newUser=new User({
        email:req.body.username,
    
        password:req.body.password
    });
    newUser.save()
        .then(()=>{
            res.render("secrets.ejs");
        })
        .catch((err)=>{
            console.log(err);
        });
    
});
app.post("/login", function (req, res) {
    const username = req.body.username;
    const password = req.body.password;

    User.findOne({ email: username })
        .then(foundUser => {
            if (foundUser) {
                if (foundUser.password === password) {
                    res.render("secrets.ejs");
                } else {
                    console.log("Incorrect password");
                    res.render("login.ejs", { error: "Incorrect password" });
                }
            } else {
                console.log("User not found");
                res.render("login.ejs", { error: "User not found" });
            }
        })
        .catch(err => {
            console.log(err);
            res.status(500).send("Internal Server Error");
        });
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});

  
