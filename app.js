const express = require('express');
const expresslayout = require('express-ejs-layouts');
const bodyparser = require('body-parser');
const path = require('path');
const connection = require('./connection');
const route = require('./routes')
const sessions = require('express-session') // This is to use a session in a App
const url = require('url')

const app = express();

var session// Creating a global session
// It has a problem that if multiple users are using the app at the same time then the information recieved will be same.
// So we need to create Multiple sessions aand store them accordingly
// req.session.destroy((err)=>{}); is used to destroy a session.

app.use(bodyparser.urlencoded({
    extended:true
}));
app.set("views", path.join(__dirname,'/views'));
app.use(express.static("static"));
app.set('view engine','ejs');
app.use(expresslayout);

app.use(sessions({secret:"sshh1122", resave:false, saveUninitialized:true})); // Initializing a sessino

app.use('/', route);


app.listen(8000 , function(err){
    if(!err){
        console.log("App is Listening at Port 8000");
    }
    else{
        console.log("Error Occured" + err);
    }
})

