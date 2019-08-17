'use strict';

// require("dotenv").config();

const express = require('express');
const cors = require('cors');
const app = express();
const superagent = require('superagent');
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
app.get('*', (request, response) => response.status(404).send(`This page does not exist!`));

function Book(info){
  const placeHolderImage = 'http://imigur.com/J5LVHEL.JPG';
  let httpRegex = /^(http:\/\/)/g;

  this.title = info.title ? info.title : 'THIS BOOK HAS BEEN STRIPPED OF ITS TITLE!';//add ternary ops
  this.author = info.author ? info.author : 'IT SEEMS THIS BOOK HAS BEEN DEVINELY AUTHORD BY A DIVINITY WHOM SHALL NOT BE NAMED...NO AUTHOR ON RECORED';
  this.isbn =
  this.image_url =
  this.discription = info.discription ? info.description : 'READ THE BOOK AND WRITE ONE!';
  this.id = info.industry
}


app.post('/search', (request,response)=>{
  let url = `https://www.googleapis.com/books/v1/volumes?q=`;
  if(request.body.search[1]=== 'author') {url += `inauthor:${request.body.search[0]}`;}
  if(request.body.search[1]=== 'title'){url+= `intitle:${request.body.search[0]}`;}
  
  superagent.get(url)
    .then(apiResponse=> apiResponse.body.items.map(bookResult=> new Book(bookResult.volumeInfo)))
    .then(results=> response.render('pages/results/show', {searchresults: results))//does this need to be response?
    .catch(error => handleError(error,response));

});

function handleError(error,response){
  console.error(error);
  if(response){
    response.status(500).send('GREAT SCOTT ITS BEEN NUKED!');
  }
}





app.listen(PORT, () => console.log(`server up on ${PORT}`));

