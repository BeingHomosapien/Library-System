const express = require("express");
const connection = require('./connection')
const url = require('url');

const route = express.Router();

route.get('/',(req,res)=>{
    session = req.session;
    res.render("home",{session:session}); // I can pass session to make the navbar responsive.
})

route.get('/books',function(req,res){
    var data = undefined;
    connection.query("Select * from test;", function(err, rows, fields){
        if (err){
            console.log(err);
        }
        else{
            data = rows;
            console.log(data);
            res.render('books', {array : data, session:req.session});
        }
    });
    
});

route.all('/login', function(req, res){
    session = req.session;
    if (req.session.logged){
        req.session.dasherr = {status:false}
        res.redirect('dashboard');
    }
    else{
        if(req.method == "GET"){
            let error = "PLease Login First!!"
            console.log(req.route.path); // This will return the path of the route from which the request is being made.
            res.render('login', {session:req.session});
        }
        else if (req.method == "POST"){
            
            var username = req.body.username;
            var password = req.body.password;
            connection.query(`Select * from users where ID = "${username}";`, function(err, rows, fields){
                if (!(err)){

                    if (username === rows[0].ID){
                        if (password === rows[0].Password){
                            session.logged = true;
                            session.username = username;
                            session.password = password;
                            res.redirect(url.format({ // This is a way to pass data while redirecting and can 
                                // be accessed using req.query.<name>
                                // or we can manually do this as /dashboard?valid="rohan"&...
                                pathname : "/dashboard"
                                // query:{
                                //     name:"rohan",
                                //     valid : "Rohan"
                                // }
                            }));
                        }
                        else{
                            console.log(username, password);
                            console.log('Please Check Your ID or Password!!')
                            res.render('login',{session:req.session})
                        }
                    }

                    else{
                        console.log(username, password);
                        console.log('Please check your ID or Password!!')
                        res.render('login',{session:req.session});
                    }
                }
                else{
                    console.log(err)
                    res.render('login',{session:req.session})
                }
            })
        }
    }
    
});

route.get('/dashboard', function(req, res){
    if (req.session.logged){
        if(req.session.username === 'admin'){
            req.session.dasherr = {status:false};
            res.render('dashboard',{session:req.session})
        }
        else{
            
            connection.query(`Select*from users u, test t where u.ID = t.IssuedTo and u.ID = "${req.session.username}";`, function(err, rows, fields){
                if (!(err)){
                    if(rows.length != 0){
                        res.render('dashboard',{data: rows, session:req.session, status:true})
                    }
                    else{
                        res.render('dashboard', {session: session, status:false})
                    }
                }
                else{
                    req.session.dasherr = {status:false, type:'error', message:"Some Error has occured please Try again!!" }
                    console.log(err);
                    res.render('dashboard', {session: req.session})
                }
            })
        }
    }
    else{
        res.redirect('login');
    }
})
route.get('/logout', function(req, res){
    req.session.destroy(function(err){
        console.log(err);
    });
    res.redirect('/login');
})

route.get('/issuerequest', function(req, res){
    var id = req.query.id;
    req.session.issue_bookid = id;
    req.session.bookid = id;

    if(req.session.logged && id){
        var info = undefined;

        connection.query(`Select*from test where BookID = "${id}" ;`, function(err, rows, fields){
            if (!(err)){
                console.log(rows[0])
                info = rows[0];
                if (rows[0] != undefined && rows[0].status == "1"){
                    req.session.dasherr= {status : true, type : "error", message : "Book has already been Issued!!"}
                    res.redirect('dashboard')
                }
                else{
                    res.render('request', {data1: info, session: req.session, type:"issue"});
                }
            }
            else{
                console.log(err);
                res.redirect('/books')
            }
        });
        
    }
    else{
        res.redirect('login')
    }
});


route.get('/returnrequest', function(req,res){
    var id = req.query.id;
    req.session.bookid = id;
    if (req.session.logged && id){
        connection.query(`Select*from test where BookID = "${id}" ;`, function(err,rows,fields){
            if(!err){
                req.session.return_bookid = id;
                if (rows[0] != undefined && rows[0].IssuedTo === req.session.username){
                    console.log('Requested')
                    res.render('request',{data1: rows[0], session:req.session, type:"return"})
                }
                else if(rows[0] != undefined){
                    req.session.dasherr= {status : true, type : "error", message : "This Book doesnot Belongs to You!!"}
                    console.log("Not requested")
                    res.redirect('dashboard')
                }
                else{
                    res.render('request',{data1: rows[0], session:req.session, type:"return"})
                }
            }
            else{
                req.session.dasherr= {status : true, type : "error", message : "Some Error has occured pleade Try again!!"}
                console.log(err)
                res.redirect('dashboard')
            }
        });
    }
    else{
        res.redirect('login');
    }
});

route.get('/removerequest', function(req, res){
    var id = req.query.id;
    req.session.remove_bookid = req.query.id;
    req.session.bookid = id;
    if(req.session.logged && req.session.username == "admin" && id){
        var info = undefined;

        connection.query(`Select*from test where BookID = "${id}" ;`, function(err, rows, fields){
            if (!(err)){
                console.log(rows[0])
                info = rows[0];
                if (rows[0] != undefined &&rows[0].status == "1"){
                    req.session.dasherr= {status : true, type : "error", message : "Book is Issued!!"}
                    res.redirect('dashboard');
                }
                else{
                    res.render('request', {data1: info, session: req.session, type:"remove"});
                }  
            }
            else{
                console.log(err);
                res.redirect('/books')
            }
        });
        
    }
    else{
        res.redirect('login')
    }

});

route.post('/request', function(req, res){
    var pass = req.body.password;
    var type = req.query.type;
    var ibookid = req.session.issue_bookid;
    var rbookid = req.session.return_bookid;
    var dbookid = req.session.remove_bookid;
    if(req.session.password === pass){
        if (type=="issue"){
            connection.query(`Update test set status = "1", IssuedTo = "${req.session.username}" where BookID = "${ibookid}";`, function(err, rows, fields){
                if(!err){
                    req.session.dasherr= {status : true, type : "success", message : "Book has been issued check ypur dashboard!!"}
                    res.redirect('dashboard')
                }
                else{
                    req.session.dasherr= {status : true, type : "error", message : "Some error has occured please Try again"}
                    console.log(err)
                    res.redirect('dashboard')
                }
            });
        }
        else if(type=="remove"){
            connection.query(`Delete from test where BookID = "${dbookid}";`,function(err, rows, fields){
                if(!err){
                    req.session.dasherr= {status : true, type : "success", message : "Book has been removed form the Library!!"}
                    res.redirect('dashboard');
                }
                else{
                    req.session.dasherr= {status : true, type : "error", message : "Some Error has occured please Try again!!"}
                    console.log(err);
                    res.redirect('dashboard')
                }
            });
        }
        else if(type == "return"){
            connection.query(`Update test set status = "0", IssuedTo = NULL where BookId = "${rbookid}" and IssuedTo = "${req.session.username}";` ,function(err, rows, fields){
                if(!err){
                    req.session.dasherr= {status : true, type : "success", message : "Book has been returned to Library!!"}
                    res.redirect('dashboard')
                }
                else{
                    req.session.dasherr= {status : true, type : "error", message : "Some Error has occured please Try again!!"}
                    console.log(err)
                    res.redirect('dashboard')
                }
            });
        }
    }
    else{
        res.redirect(`/issuerequest?id=${req.session.bookid}`)
    }
});

route.post('/add', function(req, res){
    var bookid = req.body.bookid.toUpperCase();
    var bookname = req.body.bookname;
    var author = req.body.author;
    connection.query(`Insert into test values("${bookid}", "${bookname}", "${author}", "0", NULL, NULL);`, function(err, rows, fields){
        if(!err){
            req.session.dasherr= {status : true, type : "success", message : "Book has been Added check the books section!!"}
            res.redirect('dashboard');
        }
        else if(err.errno == 1062){
            req.session.dasherr= {status : true, type : "error", message : "There is already a Book with given Book ID!!"}
            console.log(err)
            res.redirect('dashboard')
        }
        else{
            req.session.dasherr= {status : true, type : "error", message : "Some Error has occured please Try again!!"}
            res.redirect('dashboard')
        }
    });
    res.redirect('/dashboard')
});
module.exports = route ;


// var date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate(); getting current Date.
