'use strict';

// require("dotenv").config();

const express = require("express");
const cors = require("cors");
const app = express();
const superagent = require("superagent");
const PORT = process.env.PORT || 3000;
// const pg = require('pg');

app.use(cors());
app.set('view engine', 'ejs');
app.use(express.static('./public'));
app.use(express.urlencoded({extended:true}));

//routes
app.get('/', (request, response) => {
  //do something ejs-ey
  response.render('pages/index');
})






app.listen(PORT, () => console.log(`server up on ${PORT}`));

