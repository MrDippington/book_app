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

});

function Book(info){
  this.title = info.title||'THIS BOOK HAS BEEN STRIPPED OF ITS TITLE!';//add ternary ops
  this.author = info.author||'IT SEEMS THIS BOOK HAS BEEN DEVINELY AUTHORD BY A DIVINITY WHOM SHALL NOT BE NAMED...NO AUTHOR ON RECORED';
  this.discription = info.discription||'READ THE BOOK AND WRITE ONE!';
};


app.post('/search', (request,response)=>{
  let url = `https://www.googleapis.com/books/v1/volumes?q=`;
  if(request.body.search[1]=== 'author') {url += `inauthor:${request.body.search[0]}`}
  if(request.body.search[1]=== 'title'){url+= `intitle:${request.body.search[0]}`}
  superagent.get(url)
    .then(apiResponse=> apiResponse.body.items.map(bookResult=> new Book(bookResult.volumeInfo)));
    .then(results=> response.render('pages/results'))

});






app.listen(PORT, () => console.log(`server up on ${PORT}`));

