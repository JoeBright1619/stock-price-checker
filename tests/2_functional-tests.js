const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

// 🔥 Add this line to import `suite` and `test` from Mocha
const { suite, test } = require('mocha');

suite('Functional Tests', function () {
    this.timeout(10000); // Set to 10 seconds

    let initialLikes;

    test('Viewing one stock: GET request to /api/stock-prices/', function (done) {
        chai
            .request(server)
            .get("/api/stock-prices/")
            .query({ stock: 'GOOG' }) // Use .query() to append the query parameters
            .end(function (err, res) {
                assert.strictEqual(res.status, 200);
                assert.isObject(res.body);
                assert.property(res.body, 'stockData');
                assert.property(res.body.stockData, 'stock');
                assert.property(res.body.stockData, 'price');
                assert.property(res.body.stockData, 'likes');
                done();
            });
    });

    test('Viewing one stock and liking it: GET request to /api/stock-prices/', function (done) {
        chai
            .request(server)
            .get("/api/stock-prices/")
            .query({ stock: 'GOOG', like: 'true' }) // Use .query() for parameters
            .end(function (err, res) {
                assert.strictEqual(res.status, 200, 'Response status should be 200');
                assert.isObject(res.body, 'Response should be an object');
                assert.property(res.body, 'stockData', 'Response should contain stockData');
                assert.property(res.body.stockData, 'likes', 'StockData should contain likes');

                initialLikes = res.body.stockData.likes; // Store initial like count
                assert.isNumber(initialLikes, 'Likes should be a number');
                done();
            });
    });

    test('Viewing the same stock and liking it again: GET request to /api/stock-prices/', function (done) {
        chai
            .request(server)
            .get("/api/stock-prices/")
            .query({ stock: 'GOOG', like: 'true' }) // Use .query() for parameters
            .end(function (err, res) {
                assert.strictEqual(res.status, 200, 'Response status should be 200');
                assert.isObject(res.body, 'Response should be an object');
                assert.property(res.body, 'stockData', 'Response should contain stockData');
                assert.property(res.body.stockData, 'likes', 'StockData should contain likes');

                assert.strictEqual(res.body.stockData.likes, initialLikes, 'Likes should not increase if liked twice from the same IP');
                done();
            });
    });

    test('Viewing two stocks: GET request to /api/stock-prices/', function (done) {
        chai
            .request(server)
            .get("/api/stock-prices/")
            .query({ stock: ['GOOG', 'MSFT'] }) // Use .query() for multiple stocks
            .end(function (err, res) {
                assert.strictEqual(res.status, 200, 'Response status should be 200');
                assert.isObject(res.body, 'Response should be an object');
                assert.property(res.body, 'stockData', 'Response should contain stockData');
                assert.isArray(res.body.stockData, 'StockData should be an array');
                assert.strictEqual(res.body.stockData.length, 2, 'StockData array should contain two stocks');

                res.body.stockData.forEach(stock => {
                    assert.property(stock, 'stock');
                    assert.property(stock, 'price');
                    assert.property(stock, 'rel_likes', 'Response should contain relative likes');
                });

                done();
            });
    });

    test('Viewing two stocks and liking them: GET request to /api/stock-prices/', function (done) {
        chai
            .request(server)
            .get("/api/stock-prices/")
            .query({ stock: ['GOOG', 'MSFT'], like: 'true' }) // Use .query() for multiple stocks and liking
            .end(function (err, res) {
                assert.strictEqual(res.status, 200, 'Response status should be 200');
                assert.isObject(res.body, 'Response should be an object');
                assert.property(res.body, 'stockData', 'Response should contain stockData');
                assert.isArray(res.body.stockData, 'StockData should be an array');
                assert.strictEqual(res.body.stockData.length, 2, 'StockData array should contain two stocks');

                res.body.stockData.forEach(stock => {
                    assert.property(stock, 'stock');
                    assert.property(stock, 'price');
                    assert.property(stock, 'rel_likes', 'Response should contain relative likes');
                });

                done();
            });
    });
});
