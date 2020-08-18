'use strict'
require('dotenv').config();

var express = require('express');
var app = express();

const bodyParser = require('body-parser');

const osmosis = require('osmosis');

const Sequelize = require('sequelize');

const superagent = require('superagent');
const { STRING } = require('sequelize');

const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASS, {
    host: process.env.DB_HOST,
    dialect: 'mysql'
});

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

Customer.sync();
Product.sync();

(async () => {
    try {
        var customers = await Customer.findAll();        

    }
    catch (e) {
        console.log(e);
    }

    customers.forEach(async (customer) => {

        var customerName = customer.name
        var customerPhone = customer.phone
        
        var findProduct = await Product.findOne({ where: { id: customer.productId } }); 
        console.log(findProduct.name)

        osmosis
        .get(`https://www.corabastos.com.co/sitio/historicoApp2/reportes/historicos.php?c=${findProduct.corabastosCode}&d=ok`)
        .find('tbody')
        .set({'product': ['tr']})
        .data(function(listing) {
            
            var requestSms = {
                'account': 10019189,
                'apiKey': 'c1vdJfdQnzfe9rTyLkfmRaJRkMjmmN',
                'token': 'b6d67aded0fbccf4888ccf0385ed5aac',
                'toNumber': customerPhone,
                'sms': null
            }

            let htmlPrice = listing.product[0];

            var splitToPrice = htmlPrice.split("$");

            if(customer.status == 1) {
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
    
                try {
                    superagent
                        .post('https://api101.hablame.co/api/sms/v2.1/send/')
                        .type('form')
                        .send(requestSms)
                        .end((error, response) => {
                            if(response.status === 202) {
                                console.log (`Mensaje enviado al: ${customerPhone}`)
                            }
                        });
                }
                catch (err) {
                    console.error(err);
                }
            }

            else {
                console.log(`No se envía SMS a ${customerName}, dado que esta deshabilitado`)
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
})()

var port = process.env.PORT || 8080;

app.listen(port, function () {
    console.log("Server running at http://localhost:%d", port)
});