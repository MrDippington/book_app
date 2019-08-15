"use strict";

require("dotenv").config();

const express = require("express");
const cors = require("cors");
const app = express();
const superagent = require("superagent");
const PORT = process.env.PORT || 3000;
const pg = require('pg');

app.use(cors());