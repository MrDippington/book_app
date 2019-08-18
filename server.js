'use strict';

require("dotenv").config();

const express = require('express');
const cors = require('cors');
const app = express();
const superagent = require('superagent');
const PORT = process.env.PORT || 3000;
const pg = require('pg');

app.use(cors());
app.set('view engine', 'ejs');
app.use(express.static('./public'));
app.use(express.urlencoded({extended:true}));

const client = new pg.Client(process.env.DATABASE_URL);
client.connect();
client.on('error', err => console.error(err));

//routes
app.get('/', (request, response) => {
  //do something ejs-ey
  response.render('pages/index');
});
app.get('*', (request, response) => response.status(404).send(`This page does not exist!`));

function getBooks(request, response) {
  let sql = 'SELECT * FROM books';
  return client.query(sql)
    .then(res => {
      if(res.rowCount > 0) {
        console.log('res', res.rows);
        response.render('pages/books/show', {previousbooks: res.rows});
      }
    })
    .catch(error => handleError(error,response));
}

function Book(info){
  const placeHolderImage = 'http://imigur.com/J5LVHEL.JPG';
  let httpRegex = /^(http:\/\/)/g;

  this.title = info.title ? info.title : 'THIS BOOK HAS BEEN STRIPPED OF ITS TITLE!';//add ternary ops
  this.author = info.authors ? info.authors : 'IT SEEMS THIS BOOK HAS BEEN DEVINELY AUTHORD BY A DIVINITY WHOM SHALL NOT BE NAMED...NO AUTHOR ON RECORED';
  this.isbn = info.industryIdentifiers ? info.industryIdentifiers[0].identifier : `PLEASE CONSULT YOUR MAJIC 8BALL FOR THIS INFORMATION`;
  this.image_url = info.url ? info.url : `CHOOSE A ROUTE, ANY ROUTE.... CAUSE WE DONT KNOW WHERE THIS IS EITHER`;
  this.discription = info.discription ? info.description : 'READ THE BOOK AND WRITE ONE!';
  this.id = info = info.industryIdentifiers ? info.industryIdentifiers[0].identifier : '';
  this.bookshelf;
}



app.post('/search', (request,response)=>{
  //call get books is rows < 0

  let url = `https://www.googleapis.com/books/v1/volumes?q=`;
  if(request.body.search[1]=== 'author')
  {url += `inauthor:${request.body.search[0]}`;}
  if(request.body.search[1]=== 'title')
  {url+= `intitle:${request.body.search[0]}`;}


  superagent.get(url)
    .then(apiResponse=> apiResponse.body.items.map(bookResult=> new Book(bookResult.volumeInfo)))
    .then(results=> response.render('pages/searches/show', {searchresults: results}))
    .catch(error => handleError(error,response));

});

function handleError(error,response){
  console.error(error);
  if(response){
    response.status(500).send('GREAT SCOTT ITS BEEN NUKED!');
  }
}





app.listen(PORT, () => console.log(`server up on ${PORT}`));

