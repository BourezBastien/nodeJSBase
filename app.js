const express = require('express')
const jwt = require('jsonwebtoken')
const localStorage = require('localStorage')
require('dotenv').config()

const app = express()
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(__dirname + '/views'));

const secretkey = process.env.SECRET_KEY;
const user = {
    id: 1,
    name: "baba",
    password: "boubou",
    email: "bastien@gmail.com",
    admin: true
};

function generateAccessToken(user) {
    return jwt.sign(user, secretkey, { expiresIn: '1800s' });
}

app.get('/', function (req, res) {
    res.render('pages/index', { title: 'Home' });
});
app.get('/signin', function (req, res) {
    res.render('pages/signin', { title: 'Login' });
});
app.get('/api/login', (req, res) => {
    // TODO: checker en BDD le user par rapport à l'email
    if (req.query.username !== user.email || req.query.password !== user.password) {
        res.status(401).send('invalid credentials');
        return;
    }

    const accessToken = generateAccessToken(user);
    localStorage.setItem('Token', accessToken);
    res.redirect('/dashboard')

});

app.get('/api/me', authenticateToken, (req, res) => {
    res.send(req.user);
});

app.get('/api/delete', authenticateToken, (req, res) => {
    localStorage.removeItem('Token')
});

app.get('/dashboard', authenticateToken, (req, res) => {
    res.render('pages/dashboard', { title: 'Dashboard' });
});



function authenticateToken(req, res, next) {
    const token = localStorage.getItem('Token');

    if (!token) {
        return res.sendStatus(401);
    }

    jwt.verify(token, secretkey, (err, user) => {
        if (err) {
            return res.sendStatus(401);
        }
        req.user = user;
        next();
    });
}



app.listen(5001, () => console.log("Le serveur est lancer sur le port 5001"));