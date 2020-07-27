'use strict'
require('dotenv').config();

var express = require('express');
var app = express();

const bodyParser = require('body-parser');

const osmosis = require('osmosis');

const Sequelize = require('sequelize');

const superagent = require('superagent');

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

var customers = async () => Customer.findAll({
    include: {
        model: Product,
        required: true
      }
});

customers().then(respCustomers => {

    for (var i = 0; i < respCustomers.length; i++) {

        var customerName = respCustomers[i].name
        var customerPhone = respCustomers[i].phone
        console.log('Name', customerName)
        console.log('Phone', customerPhone)

        var findProduct = async () => Product.findOne({ where: { id: respCustomers[i].productId } });
        
        const currentDate = new Date()

        // TODO: No va a funcionar en Octubre (Mes 10)
        findProduct().then(respFindProduct => {
            osmosis
                .get(`https://www.corabastos.com.co/sitio/historicoApp2/reportes/historicos.php?c=${respFindProduct.corabastosCode}&d=ok&f=${currentDate.getFullYear()}-0${currentDate.getMonth()}-${currentDate.getDate()}&d=ok&l=`)
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
                
                requestSms.sms = `Hola ${customerName}, el precio de ${customerPhone} para hoy es de: ${splitToPrice[1]}`;

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
})

var port = process.env.PORT || 8080;

app.listen(port, function () {
    console.log("Server running at http://localhost:%d", port)
});