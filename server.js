const express = require('express');
const app = express();
const bcrypt = require('bcryptjs');
const session = require("express-session");
const mongoose = require("mongoose");
const MongoStore = require('connect-mongo')(session);
const Passport = require('./passport');
const CONFIG = require("./config");
const Sequelize = require('sequelize');
const bodyParser = require('body-parser');
const Users = require('./models/sql/sequelize').Users;
const flash = require("connect-flash");

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
const connection = mongoose.createConnection(`mongodb://${CONFIG.MONGO.HOST}:${CONFIG.MONGO.PORT}/${CONFIG.MONGO.DB_NAME}`, {});
const store = new MongoStore({mongooseConnection: connection});

//Handle sessions
let sessionMiddleware = session({
    resave: true,
    saveUninitialized: false,
    secret: "auth",
    store: store,
    //if maxAge not set, cookie valid for current session only(until browser restart)
    cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 10      //10 days
    },

});
app.use(sessionMiddleware);
app.use(flash());
//Initialise passport
app.use(Passport.initialize());

//Ensure persistent sessions
app.use(Passport.session());

app.use((req, res, next) => {
    res.locals.user = req.user;
    next();
});
app.post("/signup", function (req, res) {

    if (req.user) {
        res.send("loggedIn");
    } else {
        Users.find({
            where: {
                username: req.body.username
            }
        })
            .then((user) => {
                {
                    if (!user) {
                        bcrypt.genSalt(10, function (err, salt) {
                            bcrypt.hash(req.body.password, salt, function (err, hash) {
                                // Store hash in your password DB.
                                Users.create({
                                    username: req.body.username,
                                    password: hash,
                                })
                                    .then((user) => {
                                        req.login(user, (err) => {
                                            if (err) {
                                                console.log(err);
                                            }
                                            else {
                                                res.send("okay");
                                            }
                                        });
                                    }).catch((err) => {
                                    console.log(err);
                                })
                            })
                        })
                    }
                    else {
                        res.send("taken");
                    }
                }
            })
            .catch((err) => {
                console.log(err);
            })
    }

});
//Render Login Page
app.get("/login", (req, res) => {
    if (req.user)
        res.send('okay');
    else
        //console.log("loginmsg:"+req.flash("loginMsg"));
        res.send( req.flash("loginMsg"));
});
app.get("/users",(req,res)=>{
    res.send("okay");
});
//Login Route
app.post("/login", Passport.authenticate('local', {
    successRedirect: "/users",
    failureRedirect: "/login",
    failureFlash: true
}));
//Logout route
app.get("/logout", (req, res) => {
    req.logout();
    res.send("back");
});
//Listen on port
app.listen(CONFIG.SERVER.PORT, function () {
    console.log(`Server running @ http://${CONFIG.SERVER.HOST}:${CONFIG.SERVER.PORT}`);
});
