const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const path = require('path');
const cookieParser = require('cookie-parser');
const session = require('express-session');

var passport = require('passport');
var SamlStrategy = require('passport-saml').Strategy;
var saml = require('passport-saml');
var fs = require('fs');

module.exports = function () {
    let server = express(),
        create,
        start;

    create = (config, db) => {
        let routes = require('../routes');
        // set all the server things
        server.set('env', config.env);
        server.set('port', config.port);
        server.set('hostname', config.hostname);

        server.set('views',path.join(__dirname,'views'));
        server.set('view engine', 'jade');
        
        // add middleware to parse the json
        server.use(bodyParser.json());
        server.use(bodyParser.urlencoded({
            extended: false
        }));

        server.use(express.urlencoded({extended:false}));
        server.use(cookieParser());
        server.use(express.static(path.join(__dirname,'public')));

        //server.use(session({secret: 'stuff'})); 


        // set up passport
        // ============================================

        server.use(session({// TODO -> CHANGE SECRET TO SECURE FILE
            secret: 'stuff',
            proxy: true,
            resave: true,
            saveUninitialized: true
        }));

        passport.serializeUser(function(user, done) {
            console.log("serializing user");
            console.log(user)
            done(null, user);
        });
              
        passport.deserializeUser(function(user, done) {
            console.log("Deserializing user");
            //console.log(user)
            done(null, user);
        });

        var samlStrategy = new saml.Strategy({
            callbackUrl: 'http://localhost/login/callback',
            entryPoint: 'http://localhost:8080/simplesaml/saml2/idp/SSOService.php',
            issuer: 'saml-poc',
            identifierFormat: null,
            decryptionPvk: fs.readFileSync(__dirname + '/auth/key.pem', 'utf8'),
            privateCert: fs.readFileSync(__dirname + '/auth/key.pem', 'utf8'),
            validateInResponseTo: false,
            disableRequestedAuthnContext: true
          }, function(profile, done) {
              return done(null, profile);
        });

        passport.use('samlStrategy', samlStrategy);

        server.use(passport.initialize()); 
        server.use(passport.session());

        server.get('/login',
            function (req, res, next) {
                console.log('-----------------------------');
                console.log('/Start login handler');
                next();
            },
            passport.authenticate('samlStrategy'),
        );

        server.post('/login/callback',
            function (req, res, next) {
                console.log('-----------------------------');
                console.log('/Start login callback ');
                next();
            },
            passport.authenticate('samlStrategy'),
            function (req, res) {
                console.log('-----------------------------');
                console.log('login call back dumps');
                console.log(req.user);
                console.log(req.user.email)
                console.log('-----------------------------');
                res.send('Log in Callback Success');
            }
        );

        server.get('/login/check',
        function(req,res){
            console.log("User logged");
            console.log(req.user.email);
            res.send(req.isAuthenticated());
        });
        // =============================================


        //connect the database
        mongoose.connect(
            db.database,
            { 
                useNewUrlParser: true,
                useCreateIndex: true,
                useUnifiedTopology: true, 
            }
        );
        mongoose.set('useFindAndModify', false);
        const connection = mongoose.connection;
        connection.once('open', () => {
        console.log("MongoDB database connection established successfully");
        })

                
        // Set up routes
        routes.init(server);
    };

    
    start = () => {
        let hostname = server.get('hostname'),
            port = server.get('port');
        server.listen(port, function () {
            console.log('Express server listening on - http://' + hostname + ':' + port);
        });
    };
    return {
        create: create,
        start: start
    };
};