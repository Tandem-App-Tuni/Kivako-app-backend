var fs = require('fs');
var passport = require('passport');
var SamlStrategy = require('passport-saml').Strategy;
var LocalStrategy = require('passport-local').Strategy;
var saml = require('passport-saml');
var passwordHash = require('password-hash');
const User = require('../models/user');


module.exports = function () {
    passport.serializeUser(function (user, done) 
    {
        console.log('User serialization...', user);
        done(null, {
            email: user.email
        });
    });

    passport.deserializeUser(function (user, done) 
    {
        console.log('User deserialization...', user);
        done(null, user);
    });

    createSAMLLogin = (server) => 
    {
        var samlStrategy = new saml.Strategy({
                callbackUrl: 'http://localhost/login/callback',
                entryPoint: 'http://localhost:8080/simplesaml/saml2/idp/SSOService.php',
                issuer: 'saml-poc',
                identifierFormat: null,
                decryptionPvk: fs.readFileSync(__dirname + '/auth/key.pem', 'utf8'),
                privateCert: fs.readFileSync(__dirname + '/auth/key.pem', 'utf8'),
                validateInResponseTo: false,
                disableRequestedAuthnContext: true
            },
            function (profile, done) {
                return done(null, profile);
            });

        passport.use('samlStrategy', samlStrategy);
        server.use(passport.initialize());
        server.use(passport.session());

        server.get('/login', function (req, res, next) 
        {
            console.log('SAML login: request for authentication!');
            next();
        },
            passport.authenticate('samlStrategy')
        );

        server.post('/login/callback', function (req, res, next) 
        {
            console.log('SAML login: callback response from ID!');
            next();
        },
            passport.authenticate('samlStrategy'),
            function (req, res) 
            {
                console.log('SAML login: user logged in successfully!', req.session);
                res.redirect('/login/check');
            }
        );
    };

    createLocalLogin = (server) => 
    {
        var localStrategy = new LocalStrategy(
            function (userEmail, password, done) 
            {
                User.findOne({
                    email: userEmail
                }, function (err, user) 
                {
                    if (err) return done(null, err);

                    if (!user) return done(null, false);

                    if (passwordHash.verify(password, user.password) && user.isActivated) return done(null, user);
                    else return done(null, false);
                });
            }
        );

        passport.use(localStrategy);
        server.use(passport.initialize());
        server.use(passport.session());

        server.post('/login', passport.authenticate('local', {
                failureRedirect: '/login/check'
            }),
            function (req, res) 
            {
                console.log('Local login: Successfull login!', req.isAuthenticated());
                res.send('/login/check');
            }
        );

        server.post('/register-user', function (req, res, next) 
        {
            console.log('Register request:', req.body);

            let email = req.body.email;
            let password = req.body.password;

            let hashedPassword = passwordHash.generate(password);

            User.findOne({
                email: email
            }).then((credentialsData) => {
                if (!credentialsData) {
                    User.create({
                        email: email,
                        password: hashedPassword
                    }).then(newCredentials => {
                        if (!newCredentials) res.send('User has not been registered successfully...try again later!');
                        else res.send('User has registered successfully!');
                    });
                } else res.send('User already exists!');
            });
        });
    };

    return {
        createLocalLogin: createLocalLogin,
        createSAMLLogin: createSAMLLogin
    };
};