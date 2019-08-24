'use strict';

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const app = express();
const superagent = require('superagent');
const PORT = process.env.PORT || 3000;
const pg = require('pg');
const methodOverride = require('method-override');


app.use(cors());
app.set('view engine', 'ejs');
app.use(express.static('./public'));
app.use(express.urlencoded({extended:true}));
app.use(methodOverride((request, response)=> {
  if(request.body && typeof request.body === 'object' && '_method' in request.body) {
    let method = request.body._method;
    delete request.body._method;
    return method;
  }
}));

// app.use(methodOverride((request, response) => {
//   //if the request HAS .body, && .body is typeof object, && _method lives in the body
//   //all three conditions have to be true to run the code.  High level to low level
//   if(request.body && typeof request.body === 'object' && '_method' in request.body) {
//       let method = request.body._method;
//       delete request.body._method;
//       return method;
//   }
// }))
const client = new pg.Client(process.env.DATABASE_URL);
client.connect();
client.on('error', err => console.error(err));



//=========================================================================//
//=================================routes=================================//

//Home route :Shows all books in DB on one page
app.get('/', showAll);

//Search route: Allows users to search Google for new books!
app.get('/search', (request, response) => response.render(`./pages/searches/new.ejs`));

//Details Route: shows a page of book detail for single selected book
app.get('/books/:id', getBookDetails);

//Catches any unhandled gets
app.get('*', (request, response) => response.status(404).send(`This page does not exist!`));











//===============================================================================//
//===========================    Post Routes   ==================================//

//takes in values from the search field, gets results form google and creates the new book instances array
app.post('/search', getFromGoogle);
//takes in values from a book selected from the search and sends to DB
app.post('/books', addToDB);
// Updates book details based on user input
app.put('/books', updateBook);








//===============================================================================//
//==============================   Functions   ==================================//


//=============       Shows all books in DB on home page        ================//
function showAll(request, response){
  let sql = 'SELECT * FROM books;';
  return client.query(sql)
    .then(res => {
      if(res.rowCount > 0) {
        response.render('./pages/index',{books: res.rows});
      }
    })
    .catch(error => handleError(error,response));
}




//=================   gets search results form GooglyBoogly   ==================//
function getFromGoogle(request,response){
  let url = `https://www.googleapis.com/books/v1/volumes?q=`;
  if(request.body.search[1]=== 'author')
  {url += `inauthor:${request.body.search[0]}`;}
  if(request.body.search[1]=== 'title')
  {url+= `intitle:${request.body.search[0]}`;}
  superagent.get(url)
    .then(apiResponse=> apiResponse.body.items.map(bookResult=> new Book(bookResult.volumeInfo)))
    .then(results=> response.render('pages/searches/show', {searchresults: results}))
    .catch(error => handleError(error,response));
}




//===============   adds a selected book form the search tothe DB   =================\\
function addToDB(request,response){
  let sql ='INSERT INTO books(title, author, isbn, image_url, description, bookshelf) VALUES($1, $2, $3, $4, $5, $6) RETURNING id;';
  let values = [request.body.title, request.body.author, request.body.isbn, request.body.image_url, request.body.description, request.body.bookshelf];
  console.log(values);
  return client.query(sql, values)
    .then(res=>{
      if(res.rowCount > 0) {
        return response.redirect(`/books/${res.rows[0].id}`);
      }
    })
    .catch(error => handleError(error,response));
}




//==========================      Update Book details    ==========================//
function updateBook(request,response){
  let {title, author, isbn, image_url, description, bookshelf} = request.body;
  let SQL = 'UPDATE tasks SET title=$1, author=$2, isbn=$3, image_url=$4, description=$5, bookshelf=$6;';
  let values = [title, author, isbn, image_url, description, bookshelf];
  client.query(SQL, values)
    .then(update => {
      if (update.rowCount > 0) {
        return response.redirect(`/books/${id}`);
      }
    })
    .catch(err => console.error(err));
}




//============================       Get details of specific book         ====================//
function getBookDetails(request,response){
  console.log('sub atomic');
  let sql = `SELECT * FROM books WHERE id=$1;`;
  let val = [request.params.id];
  console.log(request.params, 'sub');
  return client.query(sql,val)
    .then(res => {
      if(res.rowCount > 0) {
        response.render('./pages/books/show',{books: res.rows});
      }
    })
    .catch(error => handleError(error,response));
}




//===========================        Handle Error      ====================================//
function handleError(error,response){
  console.error(error);
  if(response){
    response.status(500).send('GREAT SCOTT ITS BEEN NUKED!');
  }
}




//=====================================    Constructor ================================//
function Book(info){
  const placeHolderImage = 'http://imigur.com/J5LVHEL.JPG';
  let httpRegex = /^(http:\/\/)/g;

  this.title = info.title ? info.title : 'THIS BOOK HAS BEEN STRIPPED OF ITS TITLE!';
  this.author = info.authors ? info.authors : 'IT SEEMS THIS BOOK HAS BEEN DEVINELY AUTHORD BY A DIVINITY WHOM SHALL NOT BE NAMED...NO AUTHOR ON RECORED';
  this.isbn = info.industryIdentifiers ? info.industryIdentifiers[0].identifier : `PLEASE CONSULT YOUR MAJIC 8BALL FOR THIS INFORMATION`;
  this.image_url = info.imageLinks ? info.imageLinks.smallThumbnail.replace(httpRegex, 'https://') : placeHolderImage;

  this.description = info.description ? info.description : 'READ THE BOOK AND WRITE ONE!';
  this.id = info.industryIdentifiers ? info.industryIdentifiers[0].identifier : '';
  this.bookshelf = 'unassigned';
}



app.listen(PORT, () => console.log(`server up on ${PORT}`));





