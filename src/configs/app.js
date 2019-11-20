const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const path = require('path');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const cors = require('cors')

var passport = require('passport');
var SamlStrategy = require('passport-saml').Strategy;
var saml = require('passport-saml');
var fs = require('fs');
var favicon = require('serve-favicon');

const httpProxy = require('http-proxy');
const proxy = httpProxy.createServer({});

module.exports = function () {
    let server = express(),
        create,
        start;

    //server.use(cors());   
    server.use(cors({credentials: true, origin: 'http://localhost:3001'}));

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
        server.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));

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
            //console.log("serializing user");
            //console.log(user)
            done(null, user);
        });
              
        passport.deserializeUser(function(user, done) {
            //console.log("Deserializing user");
            //console.log(user)
            done(null, user);
        });

        // Set saml test enviroment;
        //https://medium.com/disney-streaming/setup-a-single-sign-on-saml-test-environment-with-docker-and-nodejs-c53fc1a984c9
        //sudo docker run --name=testsamlidp2 -p 8080:8080 -p 8443:8443 -e SIMPLESAMLPHP_SP_ENTITY_ID=saml-poc -e SIMPLESAMLPHP_SP_ASSERTION_CONSUMER_SERVICE=http://localhost:3000/login/callback -d kristophjunge/test-saml-idp

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
                //res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3001');
                console.log('-----------------------------');
                console.log('/Start login handler');
                next();
            },
            passport.authenticate('samlStrategy')
        );

        server.post('/login/callback',
            function (req, res, next) {
                console.log('-----------------------------');
                console.log('/Start login callback ');
                next();
            },
            passport.authenticate('samlStrategy'),
            function (req, res) {
                //res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
                console.log('[INFO]User logged succesfull: '+ req.session.passport.user.email);
                //console.log(req.session.passport.user.email)
                //res.send('Log in Callback Success');
                res.redirect('/login/check');
            }
        );

        server.get('/login/check',
            function(req,res){
                //console.log(req.session.passport.user.email);
                //console.log(req.user.email);
                //res.send(req.isAuthenticated());
                let userAuthenticaded = req.isAuthenticated();
                if(userAuthenticaded){
                    let userAlreadyRegistered = false;
                    if(userAlreadyRegistered){
                        res.redirect('http://localhost:3001/browse-match');
                    }else{
                        res.redirect('http://localhost:3001/edit-profile');
                    }
                     // IN CASE REACT APP RUNNING IN OTHER PORT CHANGE IT
                }else{
                    res.redirect('http://localhost:3001/');
                }
                

            }
        );


        server.get('/login/redirected',
            function(req,res){
                console.log(req.isAuthenticated());
                //console.log(req.user.email);
                res.send(req.isAuthenticated());
                //proxy.web(req, res, { target: 'http://localhost:3006/admin' });
            }
        );

        server.get('/isAuthenticated',
            function(req,res){
                console.log(req.isAuthenticated());
                console.log("Checking if user is authenticated");
                
                if(req.isAuthenticated()){
                    res.send(req.isAuthenticated());
                }else{
                    res.status(403).json({
                        'message': 'access denied'
                    });
                }
                
                
            }
        );
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