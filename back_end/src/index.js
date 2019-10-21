const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');


require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(bodyParser.urlencoded({
  extended: false
}));
app.use('/public', express.static('public'));

const URL = "mongodb://localhost:27017/kivakodb";
//const uri = process.env.ATLAS_URI;

mongoose.connect(URL, { useNewUrlParser: true, useCreateIndex: true }
);
/*
try {
	await mongoose.connect(URL, { useNewUrlParser: true, useCreateIndex: true });
} catch (error) {
	handleError(error);
}
*/
const connection = mongoose.connection;
connection.once('open', () => {
  console.log("MongoDB database connection established successfully");
})

const usersRouter = require('./routes/users');

app.use('/users', usersRouter);

app.listen(port, () => {
    console.log(`Server is running on port: ${port}`);
});
