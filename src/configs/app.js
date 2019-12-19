const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const path = require('path');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const cors = require('cors')
const chatServer = require('../chatServer');

var favicon = require('serve-favicon');

const httpProxy = require('http-proxy');
const proxy = httpProxy.createServer({});

const loginStrategy = require('./loginStrategy')();

// Front end Server url
const frontEndURL = 'http://localhost:3001';
const backEndURL = 'htpp://localhost:3000';

module.exports = function () 
{
    let server = express(),
        create,
        start;

    server.use(cors({origin: frontEndURL , credentials: true}));   
    /*server.use(function (req, res, next) 
    {

        // Website you wish to allow to connect
        res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3001');
    
        // Request methods you wish to allow
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    
        // Request headers you wish to allow
        res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    
        // Set to true if you need the website to include cookies in the requests sent
        // to the API (e.g. in case you use sessions)
        res.setHeader('Access-Control-Allow-Credentials', true);
    
        // Pass to next layer of middleware
        next();
    });*/

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

        loginStrategy.createLocalLogin(server);

        async function checkIfUserIsRegistered(userEmail){
            const User = require('../models/user');

            let user = User.findOne({"email": userEmail});
            
            return user;

        }

        server.get('/login/check', async function(req,res)
        {
            let userAuthenticaded = req.isAuthenticated();
            console.log('/login/check -> Checking authentication:', userAuthenticaded, req.user);

            if(userAuthenticaded)
            {
                let userAlreadyRegistered = await checkIfUserIsRegistered(req.user.email);

                if(userAlreadyRegistered===null){
                    //User not registered
                    console.log("[DEBUG]User not registered, redirecting to register page")
                    //res.redirect(frontEndURL + '/register');
                    res.send('/register');
                }
                else
                {
                    console.log("[DEBUG]User already registered")
                    res.send('/browse-match');
                }
                    // IN CASE REACT APP RUNNING IN OTHER PORT CHANGE IT
            }
            else
            {
                res.send('/');
            }
            
        });
        
        server.get('/login/redirected', function(req,res)
        {
            res.send(req.isAuthenticated());
        });

        server.get('/isAuthenticated', function(req,res)
        {
            if(req.isAuthenticated())
            {
                return res.status(200).json({
                    'isAuthenticated': req.isAuthenticated(),
                    'email': req.user.email
                });
            }
            else
            {
                res.status(403).json({
                    'message': 'access denied'
                });
            }
        });

        server.get('/logout', function(req, res)
        {
            req.logout();
            res.redirect(frontEndURL + '/');
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