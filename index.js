'use strict'
require('dotenv').config();

var should = require('should');

(5).should.be.exactly(5).and.be.a.Number;

var http = require('http');

var express = require('express');
var app = express();

const bodyParser = require('body-parser');

const osmosis = require('osmosis');
const Nexmo = require('nexmo');

const Sequelize = require('sequelize');

const superagent = require('superagent');

app.use(bodyParser.urlencoded({extended: false})); app.use(express.static((__dirname, 'public')));

const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASS, {
    host: process.env.DB_HOST,
    dialect: 'sqlite',
    logging: false,
    storage: process.env.DB_STORAGE,
});

// TODO: Pendiente de remover createdAt y updatedAt
const Customer = sequelize.define('customer', {
    name: {
        type: Sequelize.STRING
    },
    phone: {
        type: Sequelize.STRING
    }
});

const Product = sequelize.define('product', {
    name: {
        type: Sequelize.STRING
    },
    corabastos_code: {
        type: Sequelize.INTEGER
    }
});
    
Customer.belongsTo(Product)

Customer.sync()

// DROP TABLE IF EXISTS `products` (force: true)
Product.sync({force: true}).then(function () {
    
    // Crea los equipos al iniciar la creación de la tabla
    Product.create({
        name: 'Papaya maradol'
    });

    Product.create({
        name: 'Mango Tommy'
    });

    Product.create({
        name: 'Guanabana'
    });
});

// var result = async () => Product.findOne({ where: { name: 'Guanabana' } });


//DEBUG
// result().then(resp => console.log(resp.name))

app.post('/suscribe-product-price', function (req, res) {
    
    var findCustomer = async () => Customer.findOne({ where: { phone: req.body.phone } });

    findCustomer().then(resp => {
        console.log(resp)

        if(!resp) {
            
        }
        else {
            console.log('Else!!!')
        }
    })

    let price = "";

    osmosis
        .get('https://www.corabastos.com.co/sitio/historicoApp2/reportes/historicos.php?c=204004&d=ok&f=2020-07-25&d=ok&l=')
        .find('tbody')
        .set({'product': ['tr']})
        .data(function(listing) {
            var requestSms = {
                'account': 10019189,
                'apiKey': 'c1vdJfdQnzfe9rTyLkfmRaJRkMjmmN',
                'token': 'b6d67aded0fbccf4888ccf0385ed5aac',
                'toNumber': req.body.phone,
                'sms': null
        }

        let htmlPrice = listing.product[0];

        var splitToPrice = htmlPrice.split("$"); 
        

        requestSms.sms = `Hola Andrés, el precio del mango tommy para hoy es de: ${splitToPrice[1]}`;

        try {
            let res = superagent
            .post('https://api101.hablame.co/api/sms/v2.1/send/')
            .type('form')
            .send(requestSms)
            .end((err, res) => {
                // console.log(res);
            });
        }
        catch (err) {
            console.error(err);
        }
    
    })
    .log(console.log)
    .error(console.log)
    .debug(console.log)
});

var port = process.env.PORT || 8080;

app.listen(port, function () {
    console.log("Server running at http://localhost:%d", port)
});