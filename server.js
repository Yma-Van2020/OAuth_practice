const fs = require('fs');
const path = require('path');
const https = require('https');
const express = require('express');
const helmet = require('helmet');
const passport = require('passport');
const { Strategy } = require('passport-google-oauth20');
const cookieSession = require('cookie-session');

require('dotenv').config();

const config = {
    CLIENT_ID: process.env.CLIENT_ID,
    CLIENT_SECRET: process.env.CLIENT_SECRET,
    COOKIE_KEY_1: process.env.COOKIE_KEY_1,
    COOKIE_KEY_2: process.env.COOKIE_KEY_2
};

const AUTH_OPTIONS = {
    callbackURL: '/auth/google/callback',
    clientID: config.CLIENT_ID,
    clientSecret: config.CLIENT_SECRET
}

function verifyCallback(accessToken, refreshToken, profile, done){
    console.log('Google profile', profile);
    done(null, profile);
}

passport.use(new Strategy(AUTH_OPTIONS, verifyCallback));

//save the session to the cookie
passport.serializeUser((user, done) => {
    done(null, user);
})

//read the session from the cookie
passport.deserializeUser((obj, done) => {
    done(null, obj);
})

const app = express();

//security middlewares
app.use(helmet());

app.use(cookieSession({
    name: 'session',
    maxAge: 24 * 60 * 60 * 1000,
    keys: [config.COOKIE_KEY_1, config.COOKIE_KEY_2]
}));

app.use(passport.initialize());
app.use(passport.session());

function checkLoggedIn(req, res, next) {
    const isLoggedIn = true;
    if(!isLoggedIn) {
        return res.status(401).json({
            error: 'You haven\'t logged in'
        });
    }
    next();
}

app.get('/auth/google', 
    passport.authenticate('google', {
        scope: ['email']
    })
);

app.get('/auth/google/callback', 
    passport.authenticate('google', {
        failureRedirect: '/failure',
        successRedirect: '/'
    }), 
    (req, res) => {
    console.log('google called back')
    }
);

app.get('/failure', (req, res) => {
    return res.send('Failed to log in!');
})

app.get('/auth/logout', (req, res) => {

});

//adding middleware to endpoint
app.get('/secret', checkLoggedIn, (req, res) => {
    return res.send('your personal secret val is 42')
})
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

//read the two files first
https.createServer({
    key: fs.readFileSync('key.pem'),
    cert: fs.readFileSync('cer.pem')
}, app).listen(3000, () => {
    console.log(`Listening on port ${3000} ...`)
});