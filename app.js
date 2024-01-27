require('dotenv').config();

const express = require('express');
const expressLayout = require("express-ejs-layouts");
const methodOverride = require("method-override");  // override POST for PUT,DELETE
const cookieParser = require('cookie-parser');  // grab cookies store cookies , used for session store when login
const session = require('express-session'); 
const MongoStore = require('connect-mongo');    // to store a express session


const connectDB = require('./server/config/db');

const app = express();
const PORT = process.env.PORT || 5000 ;

//connect to db
connectDB();

app.use(express.urlencoded({ extended : true}));
app.use(express.json());
app.use(cookieParser());
app.use(methodOverride('_method'));// override POST for PUT,DELETE

app.use(session({   //👇🏽 lazy update the session(don't want to resave all the session on database every single time that the user refreshes the page)
    secret: 'keyboard cat',
    resave: false,  //don't save session if unmodified
    saveUninitialized: true,    // don't create session until something stored
    store: MongoStore.create({
        mongoUrl: process.env.MONGODB_URL
        // ttl: 14 * 24 * 60 * 60 /** = 14 days(time to live). Default */
    })
    //cookie: {maxAge: new Date(Date.now() * (3600000))}
}));

//contains js,css,images in server
app.use(express.static('public'));


//template engine
app.use(expressLayout);
app.set('layout','./layouts/main');
app.set('view engine','ejs');

app.use('/',require('./server/routes/main'));
app.use('/',require('./server/routes/admin'));

app.listen(PORT,()=>{
    console.log(`App listening on port ${PORT}`);
});