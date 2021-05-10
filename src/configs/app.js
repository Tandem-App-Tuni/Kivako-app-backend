const rateLimit = require('express-rate-limit');
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const path = require('path');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const cors = require('cors')
const chatServer = require('../chatServer');
const schedule = require('node-schedule')
const dailyFunctions = require('../dailyFunctions')
const maintenanceFunctions = require('../maintenanceFunctions')
var favicon = require('serve-favicon');

const loginStrategy = require('./loginStrategy')();
const logger = require('../logger');

const constants = require('./constants')

// Front end Server URL's
const frontEndURL = constants.frontEndURL; 
const adminFrontEndURL = constants.adminFrontEndURL;
const smlAuthenticationProvider = constants.smlAuthenticationProvider;

module.exports = function () {
    let server = express(),
        create,
        start;

    var allowedOrigins = [frontEndURL, adminFrontEndURL, smlAuthenticationProvider];
    
    server.use(rateLimit({
        windowMs: 24 * 60 * 60 * 1000, //24 h in milliseconds
        max: 5000,  //number of allowed request in 24 h
        message: 'Too many requests. You have exceeded the request limit!',
        headers: true,
    }));
    
    server.use(cors({
        credentials: true,
        origin: function (origin, callback) 
        {
            console.log('Request origin:', origin);
            // allow requests with no origin 
            // (like mobile apps or curl requests)
            if (!origin) return callback(null, true);

            if (allowedOrigins.indexOf(origin) === -1) {
                var msg = 'The CORS policy for this site does not ' +
                    'allow access from the specified Origin.';
                return callback(new Error(msg), false);
            }
            return callback(null, true);
        }
    }));

    var appSession;

    create = (config, db) => 
    {
        logger.init();

        let routes = require('../routes');

        // Set the server variables
        server.set('env', config.env);
        server.set('port', config.port);
        server.set('hostname', config.hostname);

        server.set('views', path.join(__dirname, 'views'));
        server.set('view engine', 'jade');

        // Add the middleware to parse the JSON's
        server.use(bodyParser.json());
        server.use(bodyParser.urlencoded({
            extended: false
        }));

        server.use(express.urlencoded({
            extended: false
        }));
        server.use(cookieParser());
        server.use(express.static(path.join(__dirname, 'public')));
        //server.use(express.static(constants.uploadsFolder));

        server.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));

        // Set up passport env
        appSession = session({ // TODO -> CHANGE SECRET TO SECURE FILE
            secret: 'stuff',
            proxy: true,
            resave: true,
            saveUninitialized: true
        });
        server.use(appSession);
        if (constants.localLoginStrategy) loginStrategy.createLocalLogin(server);
        else loginStrategy.createSAMLLogin(server);

        // Set initial LOGIN routes
        async function checkIfUserIsRegistered(userEmail) {
            const User = require('../models/user');
            let user = User.findOne({
                "email": userEmail
            });

            return user;
        }

        server.get('*', function (req, res, next) 
        {
            console.log('Request was made to: ' + req.originalUrl);
            return next();
        });

        server.post('*', function (req, res, next)
        {
            console.log('Post request was made to: ' + req.originalUrl);
            return next();
        });

        server.get('/login/check', async function (req, res) 
        {
            let userAuthenticaded = req.isAuthenticated();
            console.log('/login/check -> Checking authentication:', userAuthenticaded, req.user);

            if (userAuthenticaded) 
            {
                let userAlreadyRegistered = await checkIfUserIsRegistered(req.user.email);

                if (userAlreadyRegistered === null) 
                {
                    //User not registered
                    console.log("[DEBUG] User not registered, redirecting to register page")
                    //res.redirect(frontEndURL + '/register');
                    res.send('/register');
                } 
                else 
                {
                    if(userAlreadyRegistered.isAdmin) res.send('/list-admins')
                    else res.send('/browse-match');
                }
            } 
            else res.send('/');
        });

        server.get('/login/redirected', function (req, res) 
        {
            res.send(req.isAuthenticated());
        });

        server.get('/isAuthenticated', function (req, res) 
        {
            if (req.isAuthenticated()) 
            {
                return res.status(200).json({
                    'isAuthenticated': req.isAuthenticated(),
                    'email': req.user.email
                });
            } else 
            {
                return res.status(200).json({
                    'isAuthenticated': false,
                    'email': ''
                });
            }
        });

        server.get('/logout', function (req, res) {
            req.logout();
            req.session.destroy();
            res.redirect(frontEndURL + '/');
        });


        // Connect to the MongoDB database using mongoose.
        mongoose.connect(
            db.database, {
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


        // Set up the routes
        routes.init(server);
    };


    start = () => {
        let hostname = server.get('hostname'),
            port = server.get('port');
        var app = server.listen(port, function () {
            console.log('Express server listening on - http://' + hostname + ':' + port);
        });

        chatServer.start(app, appSession);

        // Activate daily schedule functions
        schedule.scheduleJob('0 0 * * *', function () 
        {
            dailyFunctions.runDailyFunctions();
        });

        schedule.scheduleJob('0 0 * * *', function () 
        {
            maintenanceFunctions.databaseCheck();
        });
        
        console.log("[INFO] Daily functions running succesfully!");
    };

    return {
        create: create,
        start: start
    };
};