    if(process.env.NODE_ENV!='production') {
        require('dotenv').config();
    }
    const express = require("express");
    const bcrypt = require("bcrypt");
    const passport = require("passport");
    const flash = require("express-flash");
    const session = require("express-session")

    const users = [];

    const app = express();
    const initPassport = require('./passport-config');

    initPassport(passport, (email) => {
        return users.find(user => user.email===email)
    }, (id) => {
        return users.find(user => user.id===id)
    });

    app.set("view-engine", "ejs");
    app.use(express.urlencoded({extended: false}));
    app.use(flash());
    app.use(session({ 
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: false
    }));
    app.use(passport.initialize());

    app.get('/', (req,res) => {
        res.render("index.ejs", {name: req.body.name});
    });

    app.get("/login", (req,res) => {
        res.render('login.ejs');
    });

    app.get('/register', (req,res) => {
        res.render("register.ejs");
    });

    app.post('/register', async (req,res) => {
        try{
            const hashedPasswd = await bcrypt.hash(req.body.password, 10);
            users.push({
                id: Date.now().toString(),
                name: req.body.name,
                email: req.body.email,
                password: hashedPasswd,
            });
            console.log(`User ${req.body.name} created successfully`)
            res.redirect('/login')
        } catch {
            console.log("Registration failed")
            res.redirect('/register');
        }
    });

    app.post('/login', passport.authenticate('local', {
        successRedirect: '/',
        failureRedirect: '/',
        failureFlash: true
    }));

    function checkAuthentication(req,res,next){
        if(req.isAuthenticated()){
            //req.isAuthenticated() will return true if user is logged in
            next();
        } else{
            res.redirect("/login");
        }
    }

    app.listen(3000);