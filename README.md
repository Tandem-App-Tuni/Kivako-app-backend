# Commands to run the server

* 1) Run database locally
    mongod or sudo mongod
    * In case it's not installed, install mongo: https://docs.mongodb.com/v3.2/administration/install-community/


* 2) Install server dependencies:
    npm install package.json


* 3) Run the server locally with nodemon during the development of the system, so nodemon will restart the server after you update any file:
    cd back_end/src
    nodemon server.js


* 4) To handle the SAML authentication during the development instead HAKA login for localhost test purposes, run the container image described in https://medium.com/disney-streaming/setup-a-single-sign-on-saml-test-environment-with-docker-and-nodejs-c53fc1a984c9 .The server configurations are already made, so you just need to follow the *Setup our Identity Provider* section.


* 5) You can now access the backends call using a browser or testing requisitions in other ways.

# Folder structure
 
 - auth: The folder contains help functions related to authentication of the user, as check if user is authenticated.
 - configs: All the configurations related to server are located in this folder, as database connection settings, system parameters, ports configurations, passport authentication configuration, etc.
 - controllers: Controllers handle the communication between the functions and the api calls, making this connections.
 - models: Related to the abstraction of the objects of the system. The model is writed using Mongoose as base.
 - routes: Handle the initial api call, and call the necessary controllers
 - server.js: Is the file related to run the server 
