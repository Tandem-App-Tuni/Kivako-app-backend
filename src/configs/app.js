const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const path = require('path');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const cors = require('cors')
const chatServer = require('../chatServer');

var passport = require('passport');
var SamlStrategy = require('passport-saml').Strategy;
var saml = require('passport-saml');
var fs = require('fs');
var favicon = require('serve-favicon');

const httpProxy = require('http-proxy');
const proxy = httpProxy.createServer({});

// Front end Server url
const frontEndURL = 'http://localhost:3001';
const adminFrontEndURL = 'http://localhost:3002';
const smlAuthenticationProvider = 'http://localhost:8080';

module.exports = function () {
    let server = express(),
        create,
        start;

        var allowedOrigins = [frontEndURL,adminFrontEndURL, smlAuthenticationProvider];
        server.use(cors({credentials: true,
            origin: function(origin, callback){
                console.log(origin)
                // allow requests with no origin 
                // (like mobile apps or curl requests)
                if(!origin) return callback(null, true);

                if(allowedOrigins.indexOf(origin) === -1){
                    var msg = 'The CORS policy for this site does not ' +
                    'allow access from the specified Origin.';
                    return callback(new Error(msg), false);
                }
                return callback(null, true);
            }
        }));

    //server.use(cors());   
    //server.use(cors({credentials: true, origin: 'http://localhost:3001'}));

    var appSession;

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

        appSession = session({// TODO -> CHANGE SECRET TO SECURE FILE
            secret: 'stuff',
            proxy: true,
            resave: true,
            saveUninitialized: true
        });

        server.use(appSession);

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

                console.log('[INFO]User logged succesfull: '+ req.session.passport.user.email);

                res.redirect('/login/check');
            }
        );

        async function checkIfUserIsRegistered(userEmail){
            const User = require('../models/user');

            let user = User.findOne({"email": userEmail});
            
            return user;

        }

        server.get('/login/check',
            async function(req,res){

                let userAuthenticaded = req.isAuthenticated();

                if(userAuthenticaded){
                    //let userAlreadyRegistered = false;
                    //TODO -> Change this call to function in services
                    console.log("User authenticated")
                    console.log(req.user.email);
                    let userAlreadyRegistered = await checkIfUserIsRegistered(req.user.email);
                    //console.log(userAlreadyRegistered)

                    if(userAlreadyRegistered===null){
                        //User not registered
                        console.log("[DEBUG]User not registered, redirecting to register page")
                        res.redirect(frontEndURL+'/register');
                        
                    }else{
                        console.log("[DEBUG]User already registered")
                        if(userAlreadyRegistered.isAdmin){
                            // Redirect to admin app
                            res.redirect(adminFrontEndURL+'/list-admins');
                        }else{
                            res.redirect(frontEndURL+'/browse-match');
                        }
                        //frontEndURL
                        //res.redirect('http://localhost:3001/browse-match');
                        
                        
                    }
                     // IN CASE REACT APP RUNNING IN OTHER PORT CHANGE IT
                }else{
                    res.redirect(frontEndURL+'/');
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
                //console.log(req.isAuthenticated());
                console.log("Checking if user is authenticated");
                
                if(req.isAuthenticated()){
                    //res.send(req.isAuthenticated());
                    return res.status(200).json({
                        'isAuthenticated': req.isAuthenticated(),
                        'email': req.user.email
                    });
                }else{
                    res.status(403).json({
                        'message': 'access denied'
                    });
                }
                
                
            }
        );

        server.get('/logout', function(req, res){
            console.log('[INFO]User logout succesfull: '+ req.user.email);
            req.logout();
            res.redirect(frontEndURL+'/');
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
        var app = server.listen(port, function () {
            console.log('Express server listening on - http://' + hostname + ':' + port);
        });

        chatServer.start(app, appSession);
    };
    return {
        create: create,
        start: start
    };
};