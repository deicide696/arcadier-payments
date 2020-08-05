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
                    console.log(`User added.`);

                    (async () => {
                        try {
                            var findProduct = await Product.findOne({ where: { id: req.body.productid } });
                            
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
                    var findProduct = await Product.findOne({ where: { id: req.body.productid } });
                    
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