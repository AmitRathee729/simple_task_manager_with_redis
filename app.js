const express = require("express");
const path = require("path");
const logger = require("morgan");
const bodyParser = require("body-parser");
const redis = require("redis");
const { networkInterfaces } = require("os");

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
    const title = 'Task List'
    const call = 'Next Call';

    /**
     * fetch all tasks in redis
     * 
     * lrange --> give values from the KEY
     * 'tasks' is KEY
     * 0 -1 means all values
     */ 
    client.lrange('tasks', 0, -1, function(err, reply){
        // to Show next call data
        client.hgetall('call', function(err, call){
            if (err){
                console.log(err);
            }
            console.log('Get next call data sucessfully...');

        // render data from index file which is in views folder
        res.render('index', {
            title: title,
            tasks: reply,
            call: call
            })
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

// Delete task
app.post('/task/delete', function(req, res){
    let tasksToDel = req.body.tasks;
    console.log('this is ', tasksToDel)
    // check selected task in redis or not
    client.lrange('tasks', 0, -1, function(err, tasks){
        for (let i = 0; i < tasks.length; i++) {
            // if selected task is in redis tasks list then
            if(tasksToDel.indexOf(tasks[i]) > -1){
                // lrem --> remove value from KEY
                // tasks   is KEY
                // 0    starting from index 0
                // task[i]  ending to this index
                client.lrem('tasks', 0, tasks[i], function(){
                    if (err){
                        console.log(err);
                    }
                    console.log('Tasks removed Successfully..');
                });  
            }            
        }
        res.redirect('/');
    })
})

// Add Next call Name
app.post('/call/add', function(req, res){
    const nextCall = {};

    nextCall.name = req.body.name;
    nextCall.phone = req.body.phone;
    nextCall.company = req.body.company;
    nextCall.time = req.body.time;

    /**
     * HMSET   to set multiple value and data will store like JSON format
     * call is KEY
     * name is key of JSON data and nextCall.name is name of user
     */
    client.hmset('call', ['name', nextCall.name, 'company', nextCall.company, 'phone', nextCall.phone, 'time', nextCall.time], function(err, reply){
        if (err){
            console.log(err);
        }
        console.log('Next call added sucessfully...');
        res.redirect('/');
    });
})

app.listen(3000);
console.log('Server started on port 3000');

module.exports = app;