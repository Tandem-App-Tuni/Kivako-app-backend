var supertest = require("supertest");
var should = require("should");

// This agent refers to PORT where program is runninng.

var server = supertest.agent("http://localhost:3000");

// UNIT test begin

describe("on testing user api error message", function () {



    it("API (userInfo) should return 500 error", function (done) {

        // calling home page api
        server
            .get("/api/v1/users/userInfo")//http://localhost:3000/api/v1/users/userInfo
            .expect("Content-type", /json/)
            .expect(500) // THis is HTTP response
            .end(function (err, res) {
                // HTTP status should be 200
                //console.log(res);
                res.status.should.equal(500);

                // Error key should be false.
                //res.body.error.should.equal(false);
                done();
            });
    });


    it("API (get all users) should return 500 error", function (done) {

        //  Get a list of all users in system
        server
            .get("/api/v1/users/")//http://localhost:3000/api/v1/users/
            .expect("Content-type", /json/)
            .expect(404) // THis is HTTP response
            .end(function (err, res) {
                // HTTP status should be 200
                console.log(res);
                res.status.should.equal(404);

                // Error key should be false.
                //res.body.error.should.equal(false);
                done();
            });
    });




});

