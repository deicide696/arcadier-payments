var http = require('http');
const osmosis = require('osmosis');

const accountSid = 'AC4825664ad55ff195904d4bff1603e122';
const authToken = '82c977a04e9717950f51d7ab00708624';
const client = require('twilio')(accountSid, authToken);

var server = http.createServer(function(request, response) {

    let price = "";

    response.writeHead(200, {"Content-Type": "text/plain"});

    osmosis
        .get('https://www.corabastos.com.co/sitio/historicoApp2/reportes/historicos.php?c=204004&d=ok&f=2020-07-16&d=ok&l=')
        .find('tbody')
        .set({'product': ['tr']})
        .data(function(listing) {

            console.log(listing.product[0])

            price = listing.product[0].slice(49,54)
            console.log(price)

            const accountSid = 'AC4825664ad55ff195904d4bff1603e122';
            const authToken = '82c977a04e9717950f51d7ab00708624';
            const client = require('twilio')(accountSid, authToken);

            client.messages
            .create({
                body: 'Hola Andrés, el precio del mango tommy para hoy es $' + price,
                from: '+573204511163',
                to: '+573204511163'
            })
            .then(message => console.log(message.sid));
        })
        .log(console.log)
        .error(console.log)
        .debug(console.log)


    osmosis
        .get('https://www.corabastos.com.co/sitio/historicoApp2/reportes/historicos.php?c=204604&d=ok&f=2020-07-16&d=ok&l=')
        .find('tbody')
        .set({'product': ['tr']})
        .data(function(listing) {

            console.log(listing.product[0])

            price = listing.product[0].slice(62,67)
            console.log(price)

            const accountSid = 'AC4825664ad55ff195904d4bff1603e122';
            const authToken = '82c977a04e9717950f51d7ab00708624';
            const client = require('twilio')(accountSid, authToken);

            client.messages
            .create({
                body: 'Hola Cristhian, el precio de la papaya maradol para hoy es $' + price,
                from: '+573204511163',
                to: '+573204511163'
            })
            .then(message => console.log(message.sid));
        })
        .log(console.log)
        .error(console.log)
        .debug(console.log)


    osmosis
        .get('https://www.corabastos.com.co/sitio/historicoApp2/reportes/historicos.php?c=203600&d=ok&f=2020-07-16&d=ok&l=')
        .find('tbody')
        .set({'product': ['tr']})
        .data(function(listing) {

            console.log(listing.product[0])

            price = listing.product[0].slice(46,51)
            console.log(price)

            const accountSid = 'AC4825664ad55ff195904d4bff1603e122';
            const authToken = '82c977a04e9717950f51d7ab00708624';
            const client = require('twilio')(accountSid, authToken);

            client.messages
            .create({
                body: 'Hola Paul, el precio de la guanabana para hoy es $' + price,
                from: '+573204511163',
                to: '+573204511163'
            })
            .then(message => console.log(message.sid));
        })
        .log(console.log)
        .error(console.log)
        .debug(console.log)
});

var port = process.env.PORT || 8080;
server.listen(port);
console.log("Server running at http://localhost:%d", port)