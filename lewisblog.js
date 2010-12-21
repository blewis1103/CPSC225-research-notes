var express = require('express');
var db      = require('dirty')('blog.db');
var db2     = require('dirty')('post.db');

var app = express.createServer(
  express.cookieDecoder(),
  express.session(),
  express.bodyDecoder()
);

var blog = [];
var id = 0;
var blogger;
var post = 0;
var eid = 0;


app.set('view options', {
  layout: false
});

app.set('view engine', 'ejs');

app.get('/', function (req, res) {
   if (!req.session.loggedin) {
   var p = {locals: {msg: "You are not logged in! Please provide your username and password!"}}
   res.render('login.ejs', p);
} else {
   res.redirect('/view');
}});

app.get('/login', function (req, res) {
   if (req.session.loggedin) {   
   res.redirect('/view');
   }  else {
         var p = {locals: {msg: "You are not logged in! Please provide your username and password!"}}
	 res.render('login.ejs', p);
	 }});

app.post('/login', function (req, res) {
   if (req.body.user && req.body.pass) {
      var user = db.get(req.body.user);
      if (!user) {
	 var p = {locals: {msg: "I'm sorry, the user does not exists!"}};
	   res.render('login.ejs', p);	
	} else {
           var password = db.get(req.body.user);
	   if (password.pass != req.body.pass) {
	   var u = {locals: {msg: "I'm sorry, the password is incorrect!"}};
	   res.render('login.ejs', u);
} else {
	   blogger = req.body.user;
	   req.session.loggedin = true;
	   res.redirect('/view');
}}}
    else {
        var t = {locals: {msg: "Error: You are missing one of the following account details: Username or Password. Please enter your information and try again"}};
         res.render('login.ejs', t); 
     }});

app.get('/newuser', function (req, res) {
var p = {locals: {msg: 'Time to create an account!'}}
  res.render('newuser.ejs',p);
});

app.post('/newuser', function (req, res) {
 if (req.body.user && req.body.pass && req.body.email) { 
    var username = req.body.user;
    var password = req.body.pass;
    var email = req.body.email;
    db.set(username, {name: username,
		      pass : password,
		      email : email});
   blogger = username; 
   res.redirect('/login');
  
} else {
    var t = {locals: {msg: "Error: You are missing one of the following account details: Username, Password, or Email. Please enter your information and try again"}};
    res.render('newuser.ejs', t); 
  }
});

app.get('/view', function (req, res) {
   if (!req.session.loggedin) {
	res.redirect('/login');
} else {
   var users = db.get(blogger);
   var posts = db2.get(post);
   var body = "";
   body += '<html><title>Welcome to the Best, the Worst, and the Wacky</title>';
   body += '<head><style type="text/css">body {background-image:url(http://lh4.ggpht.com/_boR8VVAqkeo/TLPJlaCD22I/AAAAAAAABdI/eRpOCTFJxw4/s576/Untitled-1%20copy.jpg);} h1 {color:white} h2 {color:white} h3 {color:white} p {color:white} a:link, a:visited, a:hover {display:block;font-weight:bold;color:#FFFFFF;background-color:blue;width:120px;text-align:center;padding:4px;text-decoration:none} ul.a {list-style-type: circle} ul.b {list-style-type: circle}</style><head>';
   body += '<body><h1><strong>The Best, The Worst, and the Wacky</strong></h1>';
   body += "<p>Welcome to The Best, The Worst, and the Wacky, a blog about all of the world's craziest, stupidest, most random things...ever! Read and enjoy, and if you have something to add yourself, just add a post! It's that simple!";
   body += '<center> <img src="http://lh5.ggpht.com/_boR8VVAqkeo/TLu4TtqbnbI/AAAAAAAABdo/1pCVDQ6fiXc/WACKY.jpg" alt="wacky"</></center>';
   body += '<h3><strong>Blog Options</strong></h3>';
   body += '<ul><li><a href="/add"> Make a New Post </a></li>';
   body += '<li><a href="/logout"> Log Out </a></li></ul>';
   body += '<p>Current blog users: ' + users.name + '</p>';
   body += '<h2>These are the latest posts:</h2>';   
	    db2.forEach(function (k, v) {
	    body += '<h2>' + v.blog.title + '</h2>';
	    body += '<a href="/edit?entryID='+ v.eid + '"> Edit this post</a><br/>'; 
	    body += '<p>Written by '+v.user+', on '+v.date+'</p>';
	    body += '<pre>';
	    body += '<p><font face="Times">' +v.blog.text+ '</font></p>';
	    body += '</pre>';
	    body += '</br>';
	});
   body += '</html>';
   res.send(body);
}});

app.get('/add', function (req, res) {
   if (!req.session.loggedin) {
	res.redirect('/login');
 } else {
   var body = '';
   body += '<html><head><style type="text/css">body {background-image:url(http://lh4.ggpht.com/_boR8VVAqkeo/TLPJlaCD22I/AAAAAAAABdI/eRpOCTFJxw4/s576/Untitled-1%20copy.jpg);} h1, h2, h3, p, form {color:white} a:link, a:visited, a:hover {display:block;font-weight:bold;color:#FFFFFF;background-color:blue;width:120px;text-align:center;padding:4px;text-decoration:none} ul.a {list-style-type: circle} ul.b {list-style-type: circle}</style><head>';
   body += '<h1>Add a New Post</h1>';
   body += '<form method="post" action="/add">';
   body += 'Title: <input type="text" name="title"/><br/><p></p>';
   body += '<textarea name="text" rows="24" cols="60"/></textarea></br>';
   body += '<input type="submit" name="submit"/></form>';
   res.send(body);
}});

app.post('/add', function (req, res) {
   if (req.body.title && req.body.text) {
      var entry = {title: req.body.title,
		text: req.body.text};
      blog[eid] = entry;
      var poster = blogger;
      var d = new Date();
      var stringdate = d.toUTCString();
      db2.set(post++, {user: poster, 
		       blog: entry,
		       eid: eid++,
		       date: stringdate});
      res.redirect('/view');
}});

app.get('/edit', function (req, res) {
   if (req.param('entryID')) {
   	id = req.param('entryID')
   	var editti = db2.get(id);
  	if (blogger != editti.user) { 
            req.session.loggedin = false;
	    var t = {locals: {msg: "Error: You do not have the credentials to edit this post. Please login with the right credentials or login and edit your own posts"}};
            res.render('login', t);
	} else {
   	   var body = '';
           body += '<html><head><style type="text/css">body {background-image:url(http://lh4.ggpht.com/_boR8VVAqkeo/TLPJlaCD22I/AAAAAAAABdI/eRpOCTFJxw4/s576/Untitled-1%20copy.jpg);} h1 {color:white} h2 {color:white} h3 {color:white} p {color:white} a:link, a:visited, a:hover {display:block;font-weight:bold;color:#FFFFFF;background-color:blue;width:120px;text-align:center;padding:4px;text-decoration:none} ul.a {list-style-type: circle} ul.b {list-style-type: circle} form {color:white}</style><head>';
           body += '<h1>Edit a Post</h1>';
           body += '<form method="post" action="/edit">';
           body += 'Title: <textarea name ="title" rows=1 cols="60"/>'+editti.blog.title+'</textarea><br/><p></p>';
           body += '<textarea name="text" rows="24" cols="60"/>'+editti.blog.text+'</textarea></br>';
           body += '<input type="submit" name="submit"/></form>';
           res.send(body); 
}} else {
	res.redirect('/view');
}});

app.post('/edit', function (req, res) {
   if (req.body.title && req.body.text) {
      var entry = {title: req.body.title,
		text: req.body.text};
      blog[eid] = entry;
      var poster = blogger;
      var d = new Date();
      var stringdate = d.toUTCString();
      db2.set(id, {user: poster, 
		       blog: entry,
		       eid: id,
		       date: stringdate,});
      res.redirect('/view');
}});

app.get('/logout', function(req, res) {
   if (req.session.loggedin) {
	req.session.loggedin = false;
	var l = {locals: {msg: "You have been logged out!"}};
	res.render('login.ejs', l);
}});

app.listen(3000);
console.log('Express app started on port 3000');
