const express = require('express');
const bodyParser = require('body-parser');
require('dotenv').config();
const app = express();
const port = 3000;

app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.json());

// require
require("./routes/routes")(app);
require("./config/db_config") (app);

// static public folder
app.use(express.static('public'));

// page not found
app.get('*', function(req, res){
    res.status(404).send('404');
});

// server
app.listen(port);
console.log(`Server started http://localhost:${port}`);