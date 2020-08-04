'use strict'
require('dotenv').config();

var express = require('express');
var app = express();

const bodyParser = require('body-parser');

const osmosis = require('osmosis');

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

// TODO: Hace falta crear la llave foranea con producto
Customer.sync()

// DROP TABLE IF EXISTS `products` (force: true)
// Product.sync({force: true}).then(function () {
    
//     Product.create({
//         name: 'Papaya maradol',
//         corabastosCode: 204604
//     });

//     Product.create({
//         name: 'Mango Tommy',
//         corabastosCode: 204004
//     });

//     Product.create({
//         name: 'Guanabana',
//         corabastosCode: 203600
//     });
// });
Product.sync()

app.post('/suscribe-product-price', function (req, res) {
    
    var findCustomer = async () => Customer.findOne({ where: { phone: req.body.phone } });

    findCustomer().then(resp => {

        if(resp === null) {

            try {
                var createCustomer = async () => Customer.create({
                    name: req.body.name,
                    phone: req.body.phone,
                    productId: req.body.productid                     
                });
                
                createCustomer().then(resp => {

                    console.log(`User added.`)

                    let price = "";

                    var findProduct = async () => Product.findOne({ where: { id: req.body.productid } });
                    
                    const currentDate = new Date()

                    findProduct().then(respFindProduct => {
                        osmosis
                        .get(`https://www.corabastos.com.co/sitio/historicoApp2/reportes/historicos.php?c=${respFindProduct.corabastosCode}&d=ok`)
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
                        
                        requestSms.sms = `Hola ${req.body.name}, el precio de ${respFindProduct.name} para hoy es de: ${splitToPrice[1]}`;
                
                        try {
                            let sendMessage = superagent
                            .post('https://api101.hablame.co/api/sms/v2.1/send/')
                            .type('form')
                            .send(requestSms)
                            .end((error, response) => {
                                
                                return res.send({success: true, message: 'Bienvenido a Ziembra, estamos felices de tenerte con nosotros, recibirás el precio de tus productos diariamente!'});
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

            return res.send({success: false, message: 'Solo puedes recibir notificaciones de un producto :D. Espera nuevas noticias de Ziembra!!!'});
        }
    })
});

var port = process.env.PORT || 8080;

app.listen(port, function () {
    console.log("Server running at http://localhost:%d", port)
});