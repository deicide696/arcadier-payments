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
    },
    ip: {
        type: Sequelize.STRING
    },
    rol: {
        type: Sequelize.STRING
    },
    status: {
        type: Sequelize.INTEGER
    }
});

const Product = sequelize.define('product', {
    name: {
        type: Sequelize.STRING
    },
    unit: {
        type: Sequelize.STRING
    },
    corabastosCode: {
        type: Sequelize.INTEGER
    },
    unitAlternative: {
        type: Sequelize.STRING
    },
    factor: {
        type: Sequelize.STRING
    },
    published: {
        type: Sequelize.INTEGER
    }
});

// TODO: Hace falta crear la llave foranea con producto
Customer.sync()
Product.sync()

app.post('/suscribe-product-price', [
    check('phone').isLength({min: 10, max: 10})
], function (req, res) {
    
    const errors = validationResult(req)
    
    // TODO: Aquí se puede hacer una validación más precisa
    if (!errors.isEmpty()) {
        // console.log(res.status(422).json({ errors: errors.array() }))    
        return res.status(422).send({success: false, message: `Error con los campos diligenciados`});
    }
    
    var findCustomer = async () => Customer.findOne({ where: { phone: req.body.phone } });

    findCustomer().then(resp => {

        if(resp === null) {

            try {
                var createCustomer = async () => Customer.create({
                    name: req.body.name,
                    phone: req.body.phone,
                    productId: req.body.productid,
                    ip: req.clientIp,
                    rol: req.body.rol
                });
                
                createCustomer().then(resp => {
                    console.log(`User added.`);

                    (async () => {
                        try {
                            var findProduct = await Product.findOne({ where: { id: req.body.productid } });
                            
                            osmosis
                            .get(`https://www.corabastos.com.co/sitio/historicoApp2/reportes/historicos.php?c=${findProduct.corabastosCode}&d=ok`)
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

                                console.log(findProduct)
                                console.log(splitToPrice)
                                
                                if(findProduct.unitAlternative === null || findProduct.factor < 1 || findProduct.published == '0') {
                                    requestSms.sms = `Ziembra.co ${findProduct.name.toUpperCase()} Promedio Precio Venta Mayorista Bogotá Calidad Corriente Kilo ${splitToPrice[3].trim().replace('\t', '')}. Aplican T&C.`;
                                }
                                
                                else {
                                    var majorPrice = findProduct.factor * parseInt(splitToPrice[3].trim().replace(',', ''));
                                    
                                    var strMajorPrice = majorPrice.toString()

                                    var finalMajorPrice = strMajorPrice.substr(0, strMajorPrice.length - 2) + '00';

                                    // var roundMajorPrice = Math.round((majorPrice / 100))

                                    // var finalMajorPrice = roundMajorPrice * 100
                                    
                                    requestSms.sms = `Ziembra.co ${findProduct.name.toUpperCase()} Promedio Precio Venta Mayorista Bogotá Calidad Corriente Kilo ${splitToPrice[3].trim().replace('\t', '')} ${findProduct.unitAlternative} $${finalMajorPrice}. Aplican T&C.`;
                                }

                                var date = new Date()

                                console.log('Hora', date.getHours())

                                // TODO: Definir UTC(-5)
                                if(!(date.getHours() >= 0 & date.getHours() < 15)) {
                                    try {
                                        superagent
                                            .post('https://api101.hablame.co/api/sms/v2.1/send/')
                                            .type('form')
                                            .send(requestSms)
                                            .end((error, response) => {
                                                if(response.status === 202) {
                                                    console.log (`Mensaje enviado al: ${req.body.phone}`)
                                                }
                                            });
                                    }

                                    catch (err) {
                                        console.error(err);
                                    }
                                }

                                else {
                                    console.log('No envía SMS dando que esta entre las 0 y 15 horas en UTC 0')
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

                            return res.send({success: true, message: `Bienvenido a Ziembra. Enviaremos a tu celular información relevante del producto ${findProduct.name.toUpperCase()}. Aplican T&C.`});
                        }
                        catch (e) {
                            console.log(e);
                        }
                    })()                    
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

            (async () => {
                try {
                    var findProduct = await Product.findOne({ where: { id: resp.productId } });

                    return res.send({success: false, message: `${req.body.name} Ya existe un registro a este número celular con el producto ${findProduct.name}, envíanos un correo a info@ziembra.co para cambiar el producto de interés o incluir productos adicionales.`});
                }
                catch (e) {
                    console.log(e);
                }
            })()            
        }
    })
});

var port = process.env.PORT || 8080;

app.listen(port, function () {
    console.log("Server running at http://localhost:%d", port)
});