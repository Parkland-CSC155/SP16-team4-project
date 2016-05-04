var express = require('express');
var bodyParser = require('body-parser');
//var routes = require('./routes/api');

var app = express();
// view engine setup
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'ejs');
var path = require('path');
app.set('views', path.join(__dirname, "views"));

//var sqlite3 = require('sqlite3').verbose();
//var db = new sqlite3.Database("./data/nutrition.db");

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
//var db = connectionString;

sql.setDefaultConfig( config );

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

/*
var test = [];
sql.execute( {  
        query: "SELECT NDB_No FROM [csc155-4db].dbo.NutritionData WHERE NDB_No = '01001'"
    } ).then( function( results ) {
        test = results[0];
        console.log( test );
    }, function( err ) {
        console.log( "Something bad happened:", err );
    } );
*/

///////////////////////// start routes /////////////////////////
app.get("/", function(req, res){
   res.render("index", { title: "Team 4 Final Project"}); 
});

// root api route takes user to login page
app.get("/api", function(req, res){
   res.render("login", { title: "Nutrition App Login" }); 
});

/*
var listSql = `
SELECT 	NDB_No, Shrt_Desc
FROM	NutritionData
`;
*/
app.get("/api/list", function(req, res){
   
   sql.execute({
       query: "SELECT [NDB_No], [Shrt_Desc] FROM [csc155-4db].[dbo].[NutritionData]"
   }).then( function( results ) {
       /*
        //console.log( results );
        var listLength = results.length;
        var pageSize = 25;
        var pageCount = Math.floor(listLength / pageSize);
        console.log(pageCount);
        var currentPage = 1;
        var foodArrays = [];
        while (results.length > 0) {
            foodArrays.push(results.splice(0, pageSize));
        }
        if (typeof req.query.page !== 'undefined') {
            currentPage = +req.query.page;
        }
        var foodList = foodArrays[+currentPage - 1];
        
        //console.log(listLength);
        */
        res.render("list", { 
           title: "Food List",
           food: results
           //pageSize: pageSize,
           //listLength: listLength,
           //pageCount: pageCount,
           //currentPage: currentPage 
        });        
   });
   
   
/*
   db.all(listSql, function(err, rows) {
       if(err) { res.send('err: '+err);}
       else {
           res.render("list", { 
               title: "Food List",
               food: rows 
               });
       }
   })  */
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
        //console.log( results );
        res.render("details", { 
           title: "Food Detail",
           food: results 
        });        
   });
   
   
/*   
   var detailSql = 'SELECT NDB_No, Shrt_Desc, Energ_Kcal, [Carbohydrt_(g)] AS Carbs, [FA_Sat_(g)] AS Fat, [Cholestrl_(mg)] AS Cholesterol, [Sodium_(mg)] AS Sodium, [Sugar_Tot_(g)] AS Sugar, [Protein_(g)] AS Protein, GmWt_Desc1 FROM NutritionData WHERE NDB_No = ' + "'" + id + "'";
   db.get(detailSql, function(err, row) {
       if(err){ res.send('err: '+err);}
       else {
           res.render("details", { 
               title: "Food Detail",
               food: row 
               });
       } 
   })  */
});

app.get("/api/search", function(req, res){
   res.render("search", { title: "Nutrition App Search" }); 
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




/*
// Don't see any point in using the api.js for routes at this time 

app.get("/api/search", require ("./routes/api"));

app.use('/', routes);
app.use('/api/', routes);
app.use('/api/list', routes);
app.use('/api/details/:id', routes);
app.use('/api/search', routes);


app.get('/', routes.api);
app.get('/api/', routes.login);
app.get('/api/list', routes.list);
app.get('/api/details/:id', routes.details);
app.get('/api/search', routes.search);
*/
