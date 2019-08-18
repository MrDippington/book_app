DROP TABLE IF EXISTS id, title, author, isbn, image_url, description;

CREATE TABLE IF NOT EXISTS books (
id SERIAL PRIMARY KEY,
title  VARCHAR(255), 
author VARCHAR(255), 
isbn NUMERIC, 
image_url VARCHAR(255),
description TEXT,
bookshelf VARCHAR(255)
);

