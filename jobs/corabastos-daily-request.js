// 'use strict'
// require('dotenv').config();

// var express = require('express');
// var app = express();

// const osmosis = require('osmosis');

// const Sequelize = require('sequelize');

// const { STRING } = require('sequelize');

// const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASS, {
//     host: process.env.DB_HOST,
//     dialect: 'mysql'
// });

// const Customer = sequelize.define('customer', {
//     name: {
//         type: Sequelize.STRING
//     },
//     phone: {
//         type: Sequelize.STRING
//     },
//     productId: {
//         type: Sequelize.INTEGER
//     },
//     ip: {
//         type: Sequelize.STRING
//     },
//     rol: {
//         type: Sequelize.STRING
//     },
//     status: {
//         type: Sequelize.INTEGER
//     }
// });

// const Product = sequelize.define('product', {
//     name: {
//         type: Sequelize.STRING
//     },
//     unit: {
//         type: Sequelize.STRING
//     },
//     corabastosCode: {
//         type: Sequelize.INTEGER
//     },
//     unitAlternative: {
//         type: Sequelize.STRING
//     },
//     factor: {
//         type: Sequelize.STRING
//     },
//     published: {
//         type: Sequelize.INTEGER
//     }
// });

// Customer.sync();
// Product.sync();

// (async () => {

//     var date = new Date();

//     var formatDate = date.toISOString().substring(0, 10)
    
//     var urlRequest = `https://www.corabastos.com.co/sitio/historicoApp2/reportes/historicos.php?c=204604&d=ok&f=${formatDate}&d=ok&l=`;
//     console.log('https://www.corabastos.com.co/sitio/historicoApp2/reportes/historicos.php?c=204604&d=ok')

//     osmosis
//     .get('https://www.corabastos.com.co/sitio/historicoApp2/reportes/historicos.php?c=204604&d=ok')
//     // .find('tbody')
//     // .set({'product': ['tr']})
//     .data(function(listing) {
        
//         console.log(listing)
//     })
//     .log(
//         // console.log
//     )
//     .error(
//         // console.log

//         console.log('Aun no hay precio para este producto el día de hoy!')
//     )
//     .debug(
//         // console.log
//     )
// })()

// process.exit(0)

// var port = process.env.PORT || 8080;

// app.listen(port, function () {
//     console.log("Server running at http://localhost:%d", port)
// });
























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

const ProductsLog = sequelize.define('products_log', {
    productId: {
        type: Sequelize.INTEGER
    },
    price1: {
        type: Sequelize.INTEGER
    },
    price2: {
        type: Sequelize.INTEGER
    },
    price3: {
        type: Sequelize.INTEGER
    }
});

Customer.sync();
Product.sync();
ProductsLog.sync();

(async () => {
    try {
        // var products = await Product.findAll({ limit: 10 });
        var products = await Product.findAll();

    }
    catch (e) {
        console.log(e);
    }
    
    var date = new Date();

    var formatDate = date.toISOString().substring(0, 10)
    
    products.forEach(async (product) => {
    
        
        var urlRequest = `https://www.corabastos.com.co/sitio/historicoApp2/reportes/historicos.php?c=${product.corabastosCode}&d=ok&f=${formatDate}&d=ok&l=`;
        console.log(urlRequest)

        osmosis
        .get(urlRequest)
        .find('tbody')
        .set({'product': ['tr']})
        .data(function(listing) {
            
            console.log(listing)

            let htmlPrice = listing.product[0];

            var splitToPrice = htmlPrice.split("$");

            var majorPrice = product.factor * parseInt(splitToPrice[3].trim().replace(',', '').replace('\t', '').replace('$','').replace(',', ''));

            var strMajorPrice = majorPrice.toString()
    
            var finalMajorPrice = strMajorPrice.substr(0, strMajorPrice.length - 2) + '00';

            // var rawPrice = splitToPrice[3].trim().replace('\t', '').replace('$','').replace(',', '')
            
            console.log(finalMajorPrice)

            var logCreated = await ProductsLog.create({
                productId: 1,
                price1: 100,
                price2: 100,
                price3: 100
            });

            // var logCreated = ProductsLog.create({
            //     productId: 1,
            //     price1: 100,
            //     price2: 100,
            //     price3: 100
            // }).then(function (users) {
            //     if (users) {
            //         // response.send(users);
            //         console.log('Log created')
            //     } else {
            //         response.status(400).send('Error in insert new record');
            //     }
            // });
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
        .delay(200)
    })
})()

var port = process.env.PORT || 8080;

app.listen(port, function () {
    console.log("Server running at http://localhost:%d", port)
});