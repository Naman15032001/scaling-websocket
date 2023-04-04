const http = require('http');
const ws = require('websocket');
const redis = require('redis');
const APPID = process.env.APPID;
let connections = [];

const WebSocketServer = ws.server;

const subscriber = redis.createClient({
    port: 6379,
    host: 'rds'
})

const publisher = redis.createClient({
    port: 6379,
    host: 'rds'
})

subscriber.on("subscribe", function (channel, count) {
    console.log(`Server ${APPID} Subscribed successfully to livechat`);
    publisher.publish("livechat", "a data message")
})

subscriber.on("message", function (channel, message) {
    try {
        console.log(`Server ${APPID} recieved ${message} in channel ${channel}`);
        connections.forEach((c) =>{
            console.log("Sent from naman ",APPID)
            c.send(APPID + ":" + message)
        } )
    } catch (error) {
        console.log("EX " + error)
    }
})



subscriber.subscribe("livechat")
const httpserver = http.createServer();

const websocket = new WebSocketServer({
    httpServer: httpserver
})

httpserver.listen(8080, () => console.log("My server is listening on port 8080"))

websocket.on('request', request => {

    const conn = request.accept(null, request.origin);

    conn.on('open', () => console.log("opened"))
    conn.on('close', () => console.log("CLOSED"))
    conn.on('message', (data) => {
        console.log(`Recieved data from client ${APPID} -> ${data.utf8Data}`);
        publisher.publish("livechat", data.utf8Data)
    });

    setTimeout(() => {
        conn.send(`Connected successfully to server ${APPID}`)
    }, 5000);
    connections.push(conn)

})