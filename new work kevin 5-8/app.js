var express = require('express');
var bodyParser = require('body-parser');
//var routes = require('./routes/api');

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

sql.setDefaultConfig( config );

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

///////////////////////// start routes /////////////////////////
app.get("/", function(req, res){
   res.render("login", { title: "Nutrition App Login" }); 
});

app.get("/list", function(req, res){
   sql.execute({
       query: "SELECT [NDB_No], [Shrt_Desc] FROM [csc155-4db].[dbo].[NutritionData] ORDER BY [Shrt_Desc] OFFSET 0 ROWS FETCH NEXT 25 ROWS ONLY",
   }).then( function( results ) {
        var pageCount = 352; 
        var currentPage = 1;
        res.render("list", { 
           title: "Food List",
           food: results,
           pageCount: pageCount,
           currentPage: currentPage 
        });        
   });
});

app.get("/list/:page", function(req, res){
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
           title: "Food List",
           food: results,
           pageCount: pageCount,
           currentPage: currentPage 
        });        
   });
});

app.post("/search", function(req, res){
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

app.post("/cSearch", function(req, res){
   sql.execute({
       query: "SELECT [NDB_No], [Shrt_Desc] FROM [csc155-4db].[dbo].[NutritionData] WHERE [Shrt_Desc] LIKE '%" + req.body.searchText + "%' ORDER BY [Shrt_Desc]"
   }).then( function( results ) {        
        res.render("cSearch", { 
            title: "Calculator Search Results",
            food: results,
            pageCount: 1 
        });        
   });
});


app.get("/details/:id", function(req, res){
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
           title: "Food Detail",
           food: results 
        });        
   });
});

//app.get("/calculator/:username", function(req, res){
app.get("/calculator", function(req, res){
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

app.get("/calculator/:food", function(req, res){
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

app.post("/clearCalculator", function(req, res){
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


app.get("/api/list/:page", function(req, res){
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

app.get("/api/search/:searchText", function(req, res){
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

app.get("/api/details/:id", function(req, res){
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
