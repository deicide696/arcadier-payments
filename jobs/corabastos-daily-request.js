'use strict'
require('dotenv').config();

var express = require('express');
var app = express();

const osmosis = require('osmosis');

const Sequelize = require('sequelize');

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

    var date = new Date();
    
    osmosis
    .get(`https://www.corabastos.com.co/sitio/historicoApp2/reportes/historicos.php?c=204604&d=ok&f=2020-08-20&d=ok&l=`)
    .find('tbody')
    .set({'product': ['tr']})
    .data(function(listing) {
        
        console.log(listing)
        process.exit(0)
    })
    .log(
        // console.log
    )
    .error(
        // console.log

        console.log('Aun no hay precio para este producto el día de hoy!')
    )
    .debug(
        // console.log
    )
})()

var port = process.env.PORT || 8080;

app.listen(port, function () {
    console.log("Server running at http://localhost:%d", port)
});