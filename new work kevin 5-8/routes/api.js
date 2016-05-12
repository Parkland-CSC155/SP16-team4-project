// router.get doesn't work
/*  
var express = require("express");
var router = express.Router();

router.use(function timeLog(req, res, next) {
  console.log('Time: ', Date.now());
  next();
});

router.get("login", function(req, res){
    res.render("login", { title: "Nutrition App Login" });
});

router.get("list", function(req, res){
    res.render("list", { title: "Nutrition App Index" });
});

router.get("details", function(req, res){
    res.render("details", { title: "Nutrition App Detail" });
});

router.get("/search", function(req, res){
    res.render("/search", { title: "Nutrition App Search" });
});

router.get("test", function(req, res){
    res.render("test", { title: "Nutrition App Test Page" });
});

router.get("id", function(req, res){
    res.send("hello world");
});

module.exports = router;
*/



// This works so far, but I don't think it will handle variable urls
var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database("C://temp//nutrition.db");

var listSql = `
SELECT 	Shrt_Desc, Energ_Kcal, [Carbohydrt_(g)] AS Carbs, [FA_Sat_(g)] AS Fat, [Cholestrl_(mg)] AS Cholesterol, [Sodium_(mg)] AS Sodium, [Sugar_Tot_(g)] AS Sugar, [Protein_(g)] AS Protein
FROM	NutritionData
`;

exports.api = function(req, res, next){
   res.send("Team 4 Final Project");
}

exports.login = function(req, res, next){
   res.render("login", { title: "Nutrition App Login" });
}

exports.list = function(req, res, next){
   db.all(listSql, function(err, rows) {
       if(err) { res.send('err: '+err);}
       else {
           console.log(rows);
           res.render("list", { 
               title: "Food Index",
               food: rows 
               });
       }
   }) 
}

exports.details = function(req, res, next){
   res.render("details", { title: "Food Detail" });
}

exports.search = function(req, res, next){
   res.render("search", { title: "Nutrition App Search" });
}






