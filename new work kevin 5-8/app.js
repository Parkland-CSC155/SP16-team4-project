var express = require('express');
var bodyParser = require('body-parser');
//var routes = require('./routes/api');

//*
var passport = require('passport');
var Strategy = require('passport-local').Strategy;
var db = require('./db');
//*
passport.use(new Strategy(function(username, password, cb) {
       
        db.users.findByUsername(username, function(err, user) {
            if (err) { return cb(err); }
            if (!user) { return cb(null, false); }
            if (user.password != password) { return cb(null, false); }
            return cb(null, user);
        });
       
}));
//*
passport.serializeUser(function(user, cb) {
  cb(null, user.id);
});
//*
passport.deserializeUser(function(id, cb) {
  db.users.findById(id, function (err, user) {
    if (err) { return cb(err); }
    cb(null, user);
  });
});
//*



var app = express();
// view engine setup
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'ejs');
var path = require('path');
app.set('views', path.join(__dirname, "views"));

var sql = require('seriate');
var config = {
	"server": "sqldbteam4kevin.database.windows.net",
	"user": "team4admin",
	"password": "admin4-team4",
	"database": "csc155-4db",
    "options": {
        encrypt: true
    }
};

var connectionString = process.env.MS_TableConnectionString;


//*
app.use(require('morgan')('combined'));
app.use(require('cookie-parser')());
app.use(require('body-parser').urlencoded({ extended: true }));
app.use(require('express-session')({ 
    secret: 'keyboard cat', 
    resave: false, 
    saveUninitialized: false 
}));
app.use(passport.initialize());
app.use(passport.session());


sql.setDefaultConfig( config );

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

////////////////////////////////////////////////////////////////

app.get('/',
  function(req, res) {
    res.render('home', { title: "Home", user: req.user });
  });

app.get('/login',
  function(req, res){
    res.render('login', { title: "Login"});
  });
  
app.post('/login', 
  passport.authenticate('local', { title: "Login", failureRedirect: '/login' }),
  function(req, res) {
    res.redirect('/');
  });
  
app.get('/logout',
  function(req, res){
    req.logout();
    res.redirect('/');
  });

app.get('/profile',
  require('connect-ensure-login').ensureLoggedIn(),
  function(req, res){
    res.render('profile', { title: "Profile", user: req.user });
  });

app.get("/session-example", function(req, res, next){

  // ensure that the data on the session
  // has been set for the first request
  if(!req.session.viewCount){
    req.session.viewCount = 0;
  }

  req.session.viewCount += 1;

  // store arbitrary data that you need between
  // requests, but is not important enough
  // to put into a database
  req.session.chosenIngredients = [
    { id: 1, qty: 3}
  ];

  res.send("View Count: " + req.session.viewCount);
});

/*
app.listen(process.env.port || 3000, function(){
    console.log("listening on port 3000");
});
*/

///////////////////////// start routes /////////////////////////
/*
app.get("/", function(req, res){
   res.render("login", { title: "Nutrition App Login" }); 
});
*/

app.get("/list", require('connect-ensure-login').ensureLoggedIn(), function(req, res){
   sql.execute({
       query: "SELECT [NDB_No], [Shrt_Desc] FROM [csc155-4db].[dbo].[NutritionData] ORDER BY [Shrt_Desc] OFFSET 0 ROWS FETCH NEXT 25 ROWS ONLY",
   }).then( function( results ) {
        var pageCount = 352; 
        var currentPage = 1;
        res.render("list", { 
           user: req.user,
           title: "Food List",
           food: results,
           pageCount: pageCount,
           currentPage: currentPage 
        });        
   });
});

app.get("/list/:page", require('connect-ensure-login').ensureLoggedIn(), function(req, res){
   var page = req.params.page;
   var skip = (page - 1) * 25;
   sql.execute({
       query: "SELECT [NDB_No], [Shrt_Desc] FROM [csc155-4db].[dbo].[NutritionData] ORDER BY [Shrt_Desc] OFFSET @skip ROWS FETCH NEXT 25 ROWS ONLY",
       params: {
           skip: {
               type: sql.INTEGER,
               val: skip
           }
       }
   }).then( function( results ) {
        var pageCount = 352; 
        var currentPage = page;
        res.render("list", { 
           user: req.user,
           title: "Food List",
           food: results,
           pageCount: pageCount,
           currentPage: currentPage 
        });        
   });
});

app.post("/search", require('connect-ensure-login').ensureLoggedIn(), function(req, res){
   sql.execute({
       query: "SELECT [NDB_No], [Shrt_Desc] FROM [csc155-4db].[dbo].[NutritionData] WHERE [Shrt_Desc] LIKE '%" + req.body.searchText + "%' ORDER BY [Shrt_Desc]"
   }).then( function( results ) {        
        res.render("list", { 
            title: "Search Results",
            food: results,
            pageCount: 1 
        });        
   });
});

app.post("/cSearch", require('connect-ensure-login').ensureLoggedIn(), function(req, res){
   sql.execute({
       query: "SELECT [NDB_No], [Shrt_Desc] FROM [csc155-4db].[dbo].[NutritionData] WHERE [Shrt_Desc] LIKE '%" + req.body.searchText + "%' ORDER BY [Shrt_Desc]"
   }).then( function( results ) {        
        res.render("cSearch", { 
            user: req.user,
            title: "Calculator Search Results",
            food: results,
            pageCount: 1 
        });        
   });
});


app.get("/details/:id", require('connect-ensure-login').ensureLoggedIn(), function(req, res){
   var id = req.params.id;
   sql.execute({
       query: "SELECT [NDB_No], [Shrt_Desc], [Energ_Kcal], [Carbohydrt_(g)] AS Carbs, [FA_Sat_(g)] AS Fat, [Cholestrl_(mg)] AS Cholesterol, [Sodium_(mg)] AS Sodium, [Sugar_Tot_(g)] AS Sugar, [Protein_(g)] AS Protein, [GmWt_Desc1] FROM [csc155-4db].[dbo].[NutritionData] WHERE [NDB_No] = @id",
       params: {
           id: {
               type: sql.NVARCHAR,
               val: id
           }
       }
   }).then( function( results ) {
        res.render("details", { 
           user: req.user,
           title: "Food Detail",
           food: results 
        });        
   });
});

//app.get("/calculator/:username", function(req, res){
app.get("/calculator", require('connect-ensure-login').ensureLoggedIn(), function(req, res){
   //var username = req.params.username;
   var username = 'user';
   sql.execute({
       query: "SELECT [Shrt_Desc], [Energ_Kcal], [Carbs], [Fat], [Cholesterol], [Sodium], [Sugar], [Protein], [GmWt_Desc1] FROM [csc155-4db].[dbo].[Calculator] WHERE [username] = @username",
       params: {
           username: {
               type: sql.NVARCHAR,
               val: username
           }
       }
   }).then( function( results ) {
        var calTotal = 0;
        var carbTotal = 0.0;
        var fatTotal = 0.0;
        var cholTotal = 0;
        var sodiumTotal = 0;
        var sugarTotal = 0.0;
        var proteinTotal = 0.0;
        for(var i=0; i<results.length; i++) {
            calTotal += results[i].Energ_Kcal;
            carbTotal += results[i].Carbs;
            fatTotal += results[i].Fat;
            cholTotal += results[i].Cholesterol;
            sodiumTotal += results[i].Sodium;
            sugarTotal += results[i].Sugar;
            proteinTotal += results[i].Protein;
        };
        res.render("calculator", { 
           user: req.user,
           title: "Nutrition Calculator",
           food: results,
           calTotal: calTotal,
           carbTotal: carbTotal,
           fatTotal: fatTotal,
           cholTotal: cholTotal,
           sodiumTotal: sodiumTotal,
           sugarTotal: sugarTotal,
           proteinTotal: proteinTotal
        });        
   });
});

app.get("/calculator/:food", require('connect-ensure-login').ensureLoggedIn(), function(req, res){
   var food = req.params.food;
   var username = 'user';            
   sql.execute({
       query: "INSERT INTO [Calculator](username, Shrt_Desc, GmWt_Desc1, Energ_Kcal, Carbs, Fat, Cholesterol, Sodium, Sugar, Protein) SELECT 'user', [Shrt_Desc], [GmWt_Desc1], [Energ_Kcal], [Carbohydrt_(g)], [FA_Sat_(g)], [Cholestrl_(mg)], [Sodium_(mg)], [Sugar_Tot_(g)], [Protein_(g)] FROM [csc155-4db].dbo.NutritionData WHERE [NDB_No] = @food; SELECT [Shrt_Desc], [Energ_Kcal], [Carbs], [Fat], [Cholesterol], [Sodium], [Sugar], [Protein], [GmWt_Desc1] FROM [csc155-4db].[dbo].[Calculator] WHERE [username] = @username;",
       params: {
           food: {
               type: sql.INTEGER,
               val: food
           },
           username: {
               type: sql.NVARCHAR,
               val: username
           }
       }
   }).then( function( results ) {
        var calTotal = 0;
        var carbTotal = 0.0;
        var fatTotal = 0.0;
        var cholTotal = 0;
        var sodiumTotal = 0;
        var sugarTotal = 0.0;
        var proteinTotal = 0.0;
        for(var i=0; i<results.length; i++) {
            calTotal += results[i].Energ_Kcal;
            carbTotal += results[i].Carbs;
            fatTotal += results[i].Fat;
            cholTotal += results[i].Cholesterol;
            sodiumTotal += results[i].Sodium;
            sugarTotal += results[i].Sugar;
            proteinTotal += results[i].Protein;
        };
        res.render("calculator", { 
           user: req.user,
           title: "Nutrition Calculator",
           food: results,
           calTotal: calTotal,
           carbTotal: carbTotal,
           fatTotal: fatTotal,
           cholTotal: cholTotal,
           sodiumTotal: sodiumTotal,
           sugarTotal: sugarTotal,
           proteinTotal: proteinTotal
        });        
   });
});

app.post("/clearCalculator", require('connect-ensure-login').ensureLoggedIn(), function(req, res){
   var username = 'user';            
   sql.execute({
       query: "DELETE FROM [Calculator]; SELECT [Shrt_Desc], [Energ_Kcal], [Carbs], [Fat], [Cholesterol], [Sodium], [Sugar], [Protein], [GmWt_Desc1] FROM [csc155-4db].[dbo].[Calculator] WHERE [username] = @username;",
       params: {
           username: {
               type: sql.NVARCHAR,
               val: username
           }
       }
   }).then( function( results ) {
        var calTotal = 0;
        var carbTotal = 0.0;
        var fatTotal = 0.0;
        var cholTotal = 0;
        var sodiumTotal = 0;
        var sugarTotal = 0.0;
        var proteinTotal = 0.0;
        for(var i=0; i<results.length; i++) {
            calTotal += results[i].Energ_Kcal;
            carbTotal += results[i].Carbs;
            fatTotal += results[i].Fat;
            cholTotal += results[i].Cholesterol;
            sodiumTotal += results[i].Sodium;
            sugarTotal += results[i].Sugar;
            proteinTotal += results[i].Protein;
        };
        res.render("calculator", { 
           user: req.user,
           title: "Nutrition Calculator",
           food: results,
           calTotal: calTotal,
           carbTotal: carbTotal,
           fatTotal: fatTotal,
           cholTotal: cholTotal,
           sodiumTotal: sodiumTotal,
           sugarTotal: sugarTotal,
           proteinTotal: proteinTotal
        });        
   });
});


app.get("/api/list/:page", require('connect-ensure-login').ensureLoggedIn(), function(req, res){
   var page = req.params.page;
   var skip = (page - 1) * 25;
   sql.execute({
       query: "SELECT [NDB_No], [Shrt_Desc] FROM [csc155-4db].[dbo].[NutritionData] ORDER BY [Shrt_Desc] OFFSET @skip ROWS FETCH NEXT 25 ROWS ONLY",
       params: {
           skip: {
               type: sql.INTEGER,
               val: skip
           }
       }
   }).then( function( results ) {
        res.json (results);        
   });
});

app.get("/api/search/:searchText", require('connect-ensure-login').ensureLoggedIn(), function(req, res){
   var searchText = req.params.searchText;
   sql.execute({
       query: "SELECT [NDB_No], [Shrt_Desc] FROM [csc155-4db].[dbo].[NutritionData] WHERE [Shrt_Desc] LIKE '%" + searchText + "%' ORDER BY [Shrt_Desc]",
       params: {
           searchText: {
               type: sql.NVARCHAR,
               val: searchText
           }
       }
   }).then( function( results ) {        
        res.json (results);        
   });
});

app.get("/api/details/:id", require('connect-ensure-login').ensureLoggedIn(), function(req, res){
   var id = req.params.id;
   sql.execute({
       query: "SELECT [NDB_No], [Shrt_Desc], [Energ_Kcal], [Carbohydrt_(g)] AS Carbs, [FA_Sat_(g)] AS Fat, [Cholestrl_(mg)] AS Cholesterol, [Sodium_(mg)] AS Sodium, [Sugar_Tot_(g)] AS Sugar, [Protein_(g)] AS Protein, [GmWt_Desc1] FROM [csc155-4db].[dbo].[NutritionData] WHERE [NDB_No] = @id",
       params: {
           id: {
               type: sql.NVARCHAR,
               val: id
           }
       }
   }).then( function( results ) {
        res.json(results);        
   });
});


///////////////////////// end routes /////////////////////////

// create 404 errors for URLs that don't exist
app.use(function(req, res, next){
   var err = new Error("Page Not Found!");
   err.status = 404;
   next(err); 
});

// handle any and all errors
app.use(function(err, req, res, next){
   res.status(err.status || 500);
   res.send(err.message);
});


app.listen(process.env.PORT || 3000, function () {
  console.log('Example app listening on port 3000!');
});
