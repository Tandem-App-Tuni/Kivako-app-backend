# Commands to install and run the backend application

* Download and install node version 12.x.x https://nodejs.org
  
* Install “nodemon” by running this command : npm install -g nodemon
  
* Download and install MongoDB community Edition , note the connection properties  -     https://docs.mongodb.com/manual/administration/install-community/
  
* Download and install MongoDBCompass for the UI based DB Management - https://www.mongodb.com/products/compass or any other suitable UI for the MongoDb.

* Connect  MongoCompass  to Mongodb using the connection properties earlier during installation of mongoDB, create a new Database  called “kivakodb” , and collection “kivakodb”

* Run database locally  mongod or sudo mongod
  
* Clone the project from this repo - https://github.com/Tandem-App-Tuni/Kivako-app-backend.git
  
* Open the project in your IDE of choice or go to the root folder of the project in the command line or IDE and run
    ```npm install```


* Run the server locally with nodemon during the development of the system, so nodemon will restart the server after you update any file:
    ```
    cd root-folder-of-application/src
    nodemon server.js
    ```

* Alternatively from the root-folder-of-application , run 
  ```
    npm run start
    ```
  
*  You can now access the backends call using a browser or testing requisitions in other ways.

# Run app in local machine:
* Clone the frontend Git repository for the Tandem application: https://github.com/Tandem-App-Tuni/Kivako-App.git. Switch to the devel branch for the latest versions.

* Clone back end.

* To configure the project to run locally you need to configure both the frontend and the backend applications.
   For the frontend, locate the file app/src/config_constants.js. 
   Change the LOCAL_TEST_ENVIRONMENT variable to true for local testing or false for deployment on a server.
   For the backend, locate the src/configs/constants.js and do the same.

* Set up the connection to SMTP(email) server locally, refer to "Set up SMTP server connection" section

* Run backend according to first section in this readme

* To run the frontend go to the app directory and run: npm run start. (Make sure to install all dependencies first by npm install package.json, or do it individually)

# Set up SMTP server connection
The application use SMTP server that set up in one of Tuni server to send email. All requirement for the connection is in place except the password of the server
In backend, the code fetchs the node environment variable "PASS" in order to get the real server password. Hence, developer need to set up the node environment in their work station.

## How to set up PASS environment variable
Real server password is store in Microsoft Team in channel: **Documents**,  in folder **Official_Documentation**, file **App_Secret.docx**
### MACOS
    On MACOS, it's recommend adding export PASS=<enter_here_server_password> to your ~/.bash_profile
    then run source ~/.bash_profile
    Remember to reset your terminal after adding the environment. 

    Note: You will need to redo it everytime you reset your computer
### LINUX
    TBD - Key word for google, how to set node environment variable
### WINDOWS
    TBD - Key word for google, how to set node environment variable

# Running the tests
* Navigate to the root folder of the project
* Run command "npm test"

# Folder structure
 
 - auth: The folder contains help functions related to authentication of the user, as check if user is authenticated.
 - configs: All the configurations related to server are located in this folder, as database connection settings, system parameters, ports configurations, passport authentication configuration, etc.
 - controllers: Controllers handle the communication between the functions and the api calls, making the connections.
 - models: Related to the abstraction of the objects of the system. The model is written using Mongoose as base.
 - routes: Handle the initial api call, and call the necessary controllers
 - server.js: Is the file related to run the server 


### License
This project is licensed under the terms of the MIT license
