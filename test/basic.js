
var Sails = require('sails').Sails;
var request = require('supertest');

var formData = {
    email: 'test@test.com', password: '1234567', confirmPassword: '1234567'
};

describe('Sails-hook-jsonwebtoken test ::', function () {

    // Var to hold a running sails app instance
    var sails, token1, token2, user;

    // Before running any tests, attempt to lift Sails
    before(function (done) {

        // Hook will timeout in 10 seconds
        this.timeout(13000);

        // Attempt to lift sails
        Sails().lift({
            hooks: {
                // Load the hook
                "sails-hook-jsonwebtoken": require('../'),
                // Skip grunt (unless your hook uses it)
                "grunt": false
            },
            log: { level: "info" }
        }, function (err, _sails) {
            if (err) return done(err);
            sails = _sails;
            return done();
        });
    });

    // After tests are complete, lower Sails
    after(function (done) {

        // Lower Sails (if it successfully lifted)
        if (sails) {
            return sails.lower(done);
        }
        // Otherwise just return
        return done();
    });


    /**
     * Let the test begin
     */

    describe('sails lift', function () {
        // Test that Sails can lift with the hook in place
        it('sails does not crash', function () {
            return true;
        });
    })

    describe('sign up', function () {
        it('account created', function (done) {
            request(sails.hooks.http.app)
                .post('/jwt/signup')
                .send(formData)
                .expect(200)
                .end(function (err, res) {
                    if (err) return done(err);
                    user = res.body.user
                    return done();
                });
        })
    })

    describe('login', function () {
        it('first attempt', function (done) {
            request(sails.hooks.http.app)
                .post('/jwt/auth')
                .send(formData)
                .expect(200)
                .end(function (err, res) {
                    if (err) return done(err);
                    token1 = res.body.token;
                    return done();
                });
        })

        it('second attempt', function (done) {
            request(sails.hooks.http.app)
                .post('/jwt/auth')
                .send(formData)
                .expect(200)
                .end(function (err, res) {
                    if (err) return done(err);
                    token2 = res.body.token;
                    return done();
                });
        })
    })

    describe('token check if still valid', function () {
        it('same tokens are returned on succesive login ', function (done) {
            if(token1 === token2) return done()
            else return done("tokens do not match")
        })
    })

    describe('clean up', function () {
        it('delete account created', function (done) {
            User.destroy({id: user.id}).then(data => done()).catch(error => done(error))
        })
    })

});