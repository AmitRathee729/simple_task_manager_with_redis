const express = require("express");
const path = require("path");
const logger = require("morgan");
const bodyParser = require("body-parser");
const redis = require("redis");

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:false}));
app.use(express.static(path.join(__dirname, 'public')));

// setup routes
app.get('/', function(req, res){
    const title = 'Task List';
    // render data from index file which is in views folder
    res.render('index', {
        title: title
    });
});

app.listen(3000);
console.log('Server started on port 3000');

module.exports = app;