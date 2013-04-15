// Express initialization
var express = require('express');
var app = express();
app.use(express.bodyParser());
app.set('title', 'scorecenter');

// Mongo initialization
var mongoUri = process.env.MONGOLAB_URI || 
  process.env.MONGOHQ_URL || 
  'mongodb://localhost/scorecenter';
var mongo = require('mongodb');
var db = mongo.Db.connect(mongoUri, function (error, databaseConnection) {
	db = databaseConnection;
});


app.all('/', function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  next();
 });
 

app.get('/highscores.json', function (request, response) {
	var jsonString="";
		db.collection("highscores", function(err, collection){
				jsonString = collection.find({ game_title: request.query.game_title } ).sort( {score: -1}).limit(10);
			});
		response.set('Content-Type', 'text/json');
		response.send(jsonString);
});

app.get('/', function(request, response) {
	var jsonString="";
	var htmlString="<html><body><p>";
	db.collection("highscores", function(err, collection){
				jsonString = collection.find().sort( {game_title: -1, score: -1})});
	cleanedString = JSON.parse(jsonString);
	for(var i = 0; i<cleanedString.length(); i++){
		if(i==0){
			htmlString+="<b>"+cleanedString[i].game_title+": </b><br />";
		}
		if(i>0&&cleanedString[i].game_title!==cleanedString[i-1].game_title){
			htmlString+="<br /><b>"+cleanedString[i].game_title+": </b><br />";
			}
		htmlString+=cleanedString[i].username+": "+cleanedString[i].score+"<br />";
	}
	htmlString+="</body></html>";
	response.set('Content-Type', 'text/html');
	response.send(htmlString);
});

app.get('/submit.json', function(request, response) {
		var d = new Date();
			db.collection("highscores", function(err, collection){
				collection.insert([{ game_title: request.query.game_title, username: request.query.username, score:request.query.score , created_at: d , _id:ObjectId()]);
		});
});

app.get('/usersearch', function(request, response) {

	var html = "<html><body><form action="+&#34+"/searchresults"+&#34+ "method="+&#34+"get"+&#34+">Username: <input type="+&#34"+text"+&#34+"><input type="+&#34+"submit"+&#34+"value="+&#34+"Submit"+&#34+"></form></body></html";
	response.set('Content-Type', 'text/html');
	response.send(html);
}
app.get('/searchresults', function(request, response) {
	db.collection("highscores", function(err, collection){
			jsonString = collection.find({ username: request.query.username } ).sort( {game_title: -1, score: -1});
			var cleanedString = JSON.parse(jsonString);
			var htmlString = "<html><body>";
			for(var i = 0; i<cleanedString.length(); i++){
		if(i==0){
			htmlString+="<b>"+cleanedString[i].game_title+": </b><br />";
		}
		if(i>0&&cleanedString[i].game_title!==cleanedString[i-1].game_title){
			htmlstring+="<br /><b>"+cleanedString[i].game_title+": </b><br />";
			}
		htmlstring+=cleanedString[i].username+": "+cleanedString[i].score+"<br />";
	}
	response.set('Content-Type', 'text/html');
	response.send(html);
	}


}
// Oh joy! http://stackoverflow.com/questions/15693192/heroku-node-js-error-web-process-failed-to-bind-to-port-within-60-seconds-of
app.listen(process.env.PORT || 3000);