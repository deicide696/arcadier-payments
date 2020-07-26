'use strict'
require('dotenv').config();

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
    dialect: 'mysql'
});

// TODO: Pendiente de remover createdAt y updatedAt
const Customer = sequelize.define('customer', {
    name: {
        type: Sequelize.STRING
    },
    phone: {
        type: Sequelize.STRING
    },
    productId: {
        type: Sequelize.INTEGER
    }
});

const Product = sequelize.define('product', {
    name: {
        type: Sequelize.STRING
    },
    corabastosCode: {
        type: Sequelize.INTEGER
    }
});
    
// Customer.belongsTo(Product)

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


//DEBUG
// result().then(resp => console.log(resp.name))

app.post('/suscribe-product-price', function (req, res) {
    
    var findCustomer = async () => Customer.findOne({ where: { phone: req.body.phone } });

    findCustomer().then(resp => {
        console.log(resp)

        if(resp === null) {
            console.log(req.body.productid)
            try {
                var createCustomer = async () => Customer.create({
                    name: req.body.name,
                    phone: req.body.phone,
                    productId: req.body.productid                     
                });
                
                createCustomer().then(resp => {

                    console.log(`User added.`)

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
                        
                
                        requestSms.sms = `Hola ${req.body.name}, el precio de la papaya maradol para hoy es de: ${splitToPrice[1]}`;
                
                        try {
                            let sendMessage = superagent
                            .post('https://api101.hablame.co/api/sms/v2.1/send/')
                            .type('form')
                            .send(requestSms)
                            .end((error, response) => {
                                
                                return res.send({success: true, message: 'Recibiras en unos momentos el precio!'});
                            });
                        }
                        catch (err) {
                            console.error(err);
                        }
                    
                    })
                    .log(
                        // console.log
                    )
                    .error(
                        // console.log
                    )
                    .debug(
                        // console.log
                    )
                })                
            }

            catch (e) {

                if (e.name === 'SequelizeUniqueConstraintError') {
                    console.log('That user already exists.')
                }

                console.log('Something went wrong with adding a user.');
            }
        }
        else {

        }
    })
});

var port = process.env.PORT || 8080;

app.listen(port, function () {
    console.log("Server running at http://localhost:%d", port)
});