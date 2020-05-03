const mysql = require('mysql');

const connection = mysql.createConnection(
    {
        host:'remotemysql.com',
        user:'JJFKCXD3CC',
        password:'us8bg5jdXp',
        database : 'JJFKCXD3CC',
        // host:'localhost',
        // user:'root',
        // password:'rohanraj@123',
        // database:'Library',
        insecureAuth: true
    }
)

connection.connect((err)=>{
    if(!err){
        console.log("Connection Established!!")
    }
    else{
        console.log("Unable to connect" + err)
    }
});

module.exports = connection;