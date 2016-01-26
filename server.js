var express = require('express'),
	app = express(),
	ejs = require('ejs'),
	http = require('http'),
	fs = require('fs'),
	bodyParser = require('body-parser'),
	passport = require('passport'),
	JawboneStrategy = require('passport-oauth').OAuth2Strategy,
	port = 5000,
	jawboneAuth = {
		clientID: process.env.JAWBONE_ID,
		clientSecret: process.env.JAWBONE_SECRET,
	authorizationURL: 'https://jawbone.com/auth/oauth2/auth',
	tokenURL: 'https://jawbone.com/auth/oauth2/token',
	callbackURL: 'https://' + process.env.DOMAIN + '/sleepdata'
	};

	app.use(bodyParser.json());

	app.use(express.static(__dirname + '/public'));

	app.set('view engine', 'ejs');
	app.set('views', __dirname + '/views');

// ----- Passport set up ----- //
app.use(passport.initialize());

app.get('/login/jawbone', 
	passport.authorize('jawbone', {
		scope: ['basic_read','sleep_read'],
		failureRedirect: '/'
	})
);

app.get('/sleepdata',
	passport.authorize('jawbone', {
		scope: ['basic_read','sleep_read'],
		failureRedirect: '/'
	}), function(req, res) {
		res.render('userdata', req.account);
	}
);

app.get('/logout', function(req, res) {
	req.logout();
	res.redirect('/');
});

app.get('/', function(req, res) {
	res.render('index');
});

passport.use('jawbone', new JawboneStrategy({
	clientID: jawboneAuth.clientID,
	clientSecret: jawboneAuth.clientSecret,
	authorizationURL: jawboneAuth.authorizationURL,
	tokenURL: jawboneAuth.tokenURL,
	callbackURL: jawboneAuth.callbackURL
}, function(token, refreshToken, profile, done) {
	var options = {
			access_token: token,
			client_id: jawboneAuth.clientID,
			client_secret: jawboneAuth.clientSecret
		},
		up = require('jawbone-up')(options);

	up.sleeps.get({}, function(err, body) {
    	if (err) {
    		console.log('Error receiving Jawbone UP data');
    	} else {
    		var jawboneData = JSON.parse(body).data;

        	for (var i = 0; i < jawboneData.items.length; i++) {
        		var date = jawboneData.items[i].date.toString(),
        			year = date.slice(0,4),
        			month = date.slice(4,6),
        			day = date.slice(6,8);


        		jawboneData.items[i].date = day + '/' + month + '/' + year;
        		jawboneData.items[i].title = jawboneData.items[i].title.replace('for ', '');
        	}

			return done(null, jawboneData, console.log('Jawbone UP data ready to be displayed.'));
    	}
    });
}));

var secureServer = http.createServer(app).listen(port, function(){
  	console.log('UP server listening on ' + port);
});
