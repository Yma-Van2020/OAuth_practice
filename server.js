const fs = require('fs');
const PORT = 3000;
const path = require('path');
const https = require('https');
const express = require('express');
const helmet = require('helmet');

const app = express();

//security
app.use(helmet());

function checkLoggedIn(req, res, next) {
    const isLoggedIn = true;
    if(!isLoggedIn) {
        return res.status(401).json({
            error: 'You haven\'t logged in'
        });
    }
    next();
}

app.get('/auth/googe', (req, res) => {

});

app.get('/auth/google/callback', (req, res) => {

});

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
}, app).listen(PORT, () => {
    console.log(`Listening on port ${PORT} ...`)
});