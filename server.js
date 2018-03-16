const express=require('express');
const app = express();
const session = require("express-session");
const mongoose = require("mongoose");
const MongoStore = require('connect-mongo')(session);
const Passport=require('./passport');
const CONFIG = require("./config");
const bodyParser=require('body-parser');

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
const connection = mongoose.createConnection(`mongodb://${CONFIG.MONGO.HOST}:${CONFIG.MONGO.PORT}/${CONFIG.MONGO.DB_NAME}`, {
});
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
//Initialise passport
app.use(Passport.initialize());

//Ensure persistent sessions
app.use(Passport.session());

app.post('/signup',(req,res)=>{
   console.log(req.body);
   res.send("got");
});
app.post('/login',(req,res)=>{
    console.log(req.body);
    res.send("got");
});
//Listen on port
app.listen(CONFIG.SERVER.PORT, function () {
    console.log(`Server running @ http://${CONFIG.SERVER.HOST}:${CONFIG.SERVER.PORT}`);
});
