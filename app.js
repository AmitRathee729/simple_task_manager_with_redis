const express = require("express");
const path = require("path");
const logger = require("morgan");
const bodyParser = require("body-parser");
const redis = require("redis");

const app = express();

// Create redis client
const client = redis.createClient();

// connect to client
client.on('connect', function(){
    console.log('Redis server connected...')
});

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

    /**
     * fetch all tasks in redis
     * 
     * lrange --> give values from the KEY
     * 'tasks' is KEY
     * 0 -1 means all values
     */ 
    client.lrange('tasks', 0, -1, function(err, reply){

    // render data from index file which is in views folder
    res.render('index', {
        title: title,
        tasks: reply
    });
    })
});

// POST task
app.post('/task/add', function(req, res){
    const task = req.body.task;

    // Add task in redis
    /**
     * rpush  --> add values in KEY at right side
     * tasks      is KEY name
     * task       which we type(add) in body
     */
    client.rpush('tasks', task, function(err, reply){
        if (err){
            console.log(err);
        }
        console.log('Task Added...');
        // after adding redirect to '/' page
        res.redirect('/');
    })
})

app.listen(3000);
console.log('Server started on port 3000');

module.exports = app;