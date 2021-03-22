require('dotenv').config();
const express = require('express');
const app = express();

const mongoose = require('mongoose');
mongoose.connect(process.env.DATABASE_URL, { useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;
db.on('connection', (err) => console.log(err));
db.once('open', () => console.log('Connected to database'));

app.use(express.json());

const linksRouter = require('./routes/links');

app.listen(3001, () => console.log('Server started'));
