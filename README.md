# Commands to run the server

* 1) Run database locally
    mongod or sudo mongod
    * In case it's not installed, install mongo: https://docs.mongodb.com/v3.2/administration/install-community/


* 2) Install server dependencies:
    ```npm install package.json```


* 3) Run the server locally with nodemon during the development of the system, so nodemon will restart the server after you update any file:
    ```
    cd back_end/src
    nodemon server.js
    ```

* 4) To handle the SAML authentication during the development instead HAKA login for localhost test purposes, run the container image described in https://medium.com/disney-streaming/setup-a-single-sign-on-saml-test-environment-with-docker-and-nodejs-c53fc1a984c9 .The server configurations are already made, so you just need to follow the *Setup our Identity Provider* section.


* 5) You can now access the backends call using a browser or testing requisitions in other ways.

# Run app in local machine:
1. Clone the frontend Git repository for the Tandem application: https://github.com/Tandem-App-Tuni/Kivako-App.git. Switch to the devel branch for the latest versions.
2. Clone back end.
3. To configure the project to run localy you need to configure both the frontend and the backend applications.
   For the frontend, locate the file app/src/config_constants.js. 
   Change the LOCAL_TEST_ENVIRONMENT variable to true for local testing or false for deployment on a server.
   For the backend, locate the src/configs/constants.js and do the same.
4. Run backend according to first section in this readme
5. To run the frontend go to the app directory and run: npm run start. (Make sure to install all dependencies first by npm install package.json, or do it individually)

# Folder structure
 
 - auth: The folder contains help functions related to authentication of the user, as check if user is authenticated.
 - configs: All the configurations related to server are located in this folder, as database connection settings, system parameters, ports configurations, passport authentication configuration, etc.
 - controllers: Controllers handle the communication between the functions and the api calls, making this connections.
 - models: Related to the abstraction of the objects of the system. The model is writed using Mongoose as base.
 - routes: Handle the initial api call, and call the necessary controllers
 - server.js: Is the file related to run the server 
