'use strict'
require('dotenv').config();

var http = require('http');
const osmosis = require('osmosis');
const Nexmo = require('nexmo');

const Sequelize = require('sequelize');

var server = http.createServer(function(request, response) {

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
        email: {
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
      
    // const Task = sequelize.define('task', {
    //     name: {
    //         type: Sequelize.STRING,
    //         allowNull: false
    //     },
    //     description: Sequelize.TEXT,
    //     status: {
    //         type: Sequelize.STRING,
    //         defaultValue: 'pendiente',
    //         allowNull: false,
    //     },
    //     deadline: Sequelize.DATE
    // });
      
    Customer.belongsTo(Product)

//     sequelize.authenticate()
//     .then(() => {
//         console.log('Conectado')
//     })
//     .catch(err => {
//         console.log('No se conecto')
//     })




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

    var result = async () => Product.findOne({ where: { name: "Guanabana" } });

    result().then(resp => console.log(resp.name))














//     let price = "";

//     const nexmo = new Nexmo({
//         apiKey: '3423ae0e',
//         apiSecret: '3rnBo3WkeURTG5KT',
//     });

//     response.writeHead(200, {"Content-Type": "text/plain"});

//     osmosis
//         .get('https://www.corabastos.com.co/sitio/historicoApp2/reportes/historicos.php?c=204004&d=ok&f=2020-07-16&d=ok&l=')
//         .find('tbody')
//         .set({'product': ['tr']})
//         .data(function(listing) {

//             console.log(listing.product[0])

//             price = listing.product[0].slice(49,54)
//             console.log(price)
        
//             nexmo.message.sendSms('Ziembra Inc.', '573204511163', 'Hola Cristhian, el precio de la papaya maradol para hoy es $' + price);
//         })
//         .log(console.log)
//         .error(console.log)
//         .debug(console.log)
    
















//     // osmosis
//     //     .get('https://www.corabastos.com.co/sitio/historicoApp2/reportes/historicos.php?c=204604&d=ok&f=2020-07-16&d=ok&l=')
//     //     .find('tbody')
//     //     .set({'product': ['tr']})
//     //     .data(function(listing) {

//     //         console.log(listing.product[0])

//     //         price = listing.product[0].slice(62,67)
//     //         console.log(price)

//     //     })
//     //     .log(console.log)
//     //     .error(console.log)
//     //     .debug(console.log)


//     // osmosis
//     //     .get('https://www.corabastos.com.co/sitio/historicoApp2/reportes/historicos.php?c=203600&d=ok&f=2020-07-16&d=ok&l=')
//     //     .find('tbody')
//     //     .set({'product': ['tr']})
//     //     .data(function(listing) {

//     //         console.log(listing.product[0])

//     //         price = listing.product[0].slice(46,51)
//     //         console.log(price)

//     //     })
//     //     .log(console.log)
//     //     .error(console.log)
//     //     .debug(console.log)
});

var port = process.env.PORT || 8080;
server.listen(port);
console.log("Server running at http://localhost:%d", port)