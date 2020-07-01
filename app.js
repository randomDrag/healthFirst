// req all files 
// adding express
const express = require("express");

// inst bodyparser 

const bodyparser = require("body-parser");

const mongoose = require("mongoose");

// inst render engine

const ejs = require("ejs");



const bcrypt = require("bcrypt");
//session to 
const session = require("express-session");

const passport = require("passport");

const localStrategy = require("passport-local").Strategy;


//number of round requied
const saltRounds = 10;

//express init in app
const app = express();

//setting view engine
app.set("view engine", "ejs");

//setting body parser
app.use(bodyparser.urlencoded({
    extended: false
}));

//using public static folder
app.use(express.static("public"));

//using app session

app.use(session({

    secret: "j.",
    resave: false,
    saveUninitialized: true

}));

//init passport
app.use(passport.initialize());

//using session
app.use(passport.session());


mongoose.connect("mongodb://127.0.0.1:27017/healthFirst",{

useUnifiedTopology: true,
useNewUrlParser: true

});

mongoose.set("useCreateIndex", true);
mongoose.set("useFindAndModify", false);


// schema of healthFirstOrders

const healthFirstOrdersSchema = new mongoose.Schema({

    Full_Name : String,
    Email : String ,
    Address : String ,
    Mobile_number : String,
    Info : String


});


// model of hfo

const Order = mongoose.model("order",healthFirstOrdersSchema);


//user DB Schema

const UserSchema = new mongoose.Schema({

    User_Email: String,
    User_Password: String
  


});

//


// adding plugin in moongose
// UserSchema.plugin(passportLocalMongoose);


//user model

const User = mongoose.model("user", UserSchema);


passport.use(new localStrategy({
    usernameField: "Email",
    passwordField: "Password"
}, function (email, password, done) {

    User.findOne({
        User_Email: email
    }, function (err, user) {
        if (!user) {
            return done(null, false, {
                message: "email not found"
            });
        }

        bcrypt.compare(password, user.User_Password, function (err, isMatch) {
            if (err) throw err;
            if (isMatch) {
                return done(null, user);
            }

        });

    });


}));

passport.serializeUser(function (user, done) {
    done(null, user.id);
});


passport.deserializeUser(function (id, done) {
    User.findById(id, function (err, user) {
        done(err, user);
    });
});







app.get("/",function(req, res){

    res.render("index/Home");


});


app.get("/mylove", function(req,res){


    res.render("index/s");

});


app.get("/product",function(req,res){

    res.render("index/address");



});

app.post("/product",function(req,res){

    const data = req.body;

    console.log(data);

    const item = new Order({

        Full_Name : data.fullname,
        Email : data.Email ,
        Address : data.address ,
        Mobile_number : data.Number,
        Info : data.ProductInfo

    });

    item.save();
    res.redirect("/");

});



app.get("/data",function(req,res){

    if(req.isAuthenticated()){

    Order.find({},(err,data)=>{

        if(!err){

            res.render("index/table",{dat : data});
        }else{

           

        }



    });
}else{
res.redirect("/");

}

    


});


app.get("/eastorwestmykittuisbest", function (req, res) {

    res.render("index/reg");

});





app.post("/register", function (req, res) {
  
    let email = req.body.Email;
    let password = req.body.Password;

    bcrypt.hash(password, saltRounds).then(function (hash) {
        // Store hash in your password DB.

        const Newuser = User({
         
            User_Email: email,
            User_Password: hash
        });

        Newuser.save(function (err) {

            if (err) {
                res.redirect("/");
            } else {

               res.redirect("/");
            }


        });
    });
});






app.get("/signup", function (req, res) {


    res.render("index/login"
    );


});

app.post("/signup", function (req, res, next) {

    passport.authenticate("local", {
        successRedirect: "/data",
        failureRedirect: "/signup"


    })(req, res, next);

});





//The 404 Route (ALWAYS Keep this as the last route)
app.get('*', function(req, res){
    res.render("notFound");
  });

//sys port

app.listen("3000",function(){

    console.log("server is running well done......");

});

