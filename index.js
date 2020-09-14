'use strict'
require('dotenv').config();

var express = require('express');
var app = express();

const bodyParser = require('body-parser');

const osmosis = require('osmosis');

const Sequelize = require('sequelize');

const superagent = require('superagent');

const { check, validationResult } = require('express-validator');

// require request-ip and register it as middleware
var requestIp = require('request-ip');
app.use(requestIp.mw())

app.use(bodyParser.json());

const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASS, {
    host: process.env.DB_HOST,
    dialect: 'mysql'
});

const Transaction = sequelize.define('transaction', {
    invoice: {
        type: Sequelize.STRING
    },
    currency: {
        type: Sequelize.STRING
    },
    total: {
        type: Sequelize.STRING
    },
    hashkey: {
        type: Sequelize.STRING
    },
    gateway: {
        type: Sequelize.STRING
    },
    paykey: {
        type: Sequelize.STRING
    } 
});

Transaction.sync()

app.post('/payu/paykey', function (req, res) {

    let randomKey = Math.random().toString(36).substring(7)

    try {
        var createTransaction = async () => Transaction.create({
            invoice: req.body.invoiceno,
            currency: req.body.currency,
            total: req.body.total,
            hashkey: req.body.hashkey,
            gateway: req.body.gateway,
            paykey: randomKey
        });
        
        createTransaction().then(resp => {
            console.log(`Transacition ${randomKey} added.`);
            
            return res.status(200).send(randomKey);
        })                
    }

    catch (e) {

        if (e.name === 'SequelizeUniqueConstraintError') {
            console.log('That user already exists.')
        }

        console.log('Something went wrong with adding a user.');
    }
});

app.get('/payu/web-checkout', function (req, res) {

    // let invoice = req.query.invoiceno

    res.sendFile(__dirname + '/form.html');
});

app.get('/transfer/web-checkout', function (req, res) {

    // let invoice = req.query.invoiceno

    res.sendFile(__dirname + '/form-transfer.html');
});

app.get('/wompi/web-checkout', function (req, res) {

    // let invoice = req.query.invoiceno

    res.sendFile(__dirname + '/form-wompi.html');
});

app.post('/launch/', function (req, res) {

    // (async() => {

    //     var request = {
    //         merchantId: 508029,
    //         ApiKey: '4Vj8eK4rloUd272L48hsrarnUA',
    //         referenceCode: 'TestPayU',
    //         accountId: '512326',
    //         description: 'Test PAYU',
    //         amount: 3,
    //         tax: 0,
    //         taxReturnBase: 0,
    //         currency: 'USD',
    //         signature: 'ba9ffa71559580175585e45ce70b6c37',
    //         test: 1,
    //         buyerEmail: 'test@test.com'
    //     }
    
    //     let url = 'https://sandbox.checkout.payulatam.com/ppp-web-gateway-payu';
    
    //     console.log(JSON.stringify(request, null, 4));
    
    //     try {
    
    //         let res = await superagent
    //             .post(url)
    //             // .send(request)
    //             // .set('Content-Type', 'application/x-www-form-urlencoded')
    //             // .set('x-apikey', '0djTDt98IRzCiHdGMCQP55bhTRYGGPr1')
    //             // .set('Content-Transfer-Encoding', 'UTF-8');
    
    
    //         console.log(JSON.stringify(res.body, null, 4));            
    
    //         // socketJoining.emit('data', respuesta);
    //     }
    
    //     catch (e) {
    //         console.log(e);
    //     }
    // })();

    // return res.status(200).send('Good Job!');
});

var port = process.env.PORT || 8080;

app.listen(port, function () {
    console.log("Server running at http://localhost:%d", port)
});