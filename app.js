//jshint esversion:6
require("dotenv").config();

console.log(process.env.API_KEY)

const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const encrypt = require("mongoose-encryption");
mongoose.set('strictQuery', true);  //  Apago un warning

// const _ = require("lodash");
// const date = require(__dirname + "/date.js");

mongoose.connect("mongodb://127.0.0.1:27017/userDB", { useNewUrlParser: true });
const app = express();
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));


const userSchema = new mongoose.Schema ({
    email: String,
    password: String
});

// encryptedFields es el array de campos que quiero encriptar (de mi Schema)

// Con esto, cuando se corra .save(), se encriptará el contenido del objeto en la colección
// y al corre .find(), se desencriptará, para poder chequear el input del usuario y el valor real del campo.
userSchema.plugin(encrypt, { secret: process.env.SECRET, encryptedFields: ["password"]}); 

const User = new mongoose.model("User", userSchema);

app.get("/", function (req, res) {
    res.render("home");
});
app.get("/login", function (req, res) {
    res.render("login");
});
app.get("/register", function (req, res) {
    res.render("register");
});

app.post("/register", function (req, res) {
    const newUser = new User({
        email: req.body.username,
        password: req.body.password
    });
    newUser
        .save()
        .then(function () {
            res.render("secrets");
        })
        .catch(function (err) {
            console.log(err);
        });
});

app.post("/login", function (req, res) {
    const username = req.body.username;
    const password = req.body.password;

    User
        .findOne({ email: username })
        .then(function (foundUser) {
            if (foundUser) {
                console.log(foundUser);
                if (foundUser.password === password) {
                    res.render("secrets");
                }
            }
        })
        .catch(function (err) {
            console.log(err);
        });
});

app.listen(3000, function () {
    console.log("Server up and running on port 3000");
});