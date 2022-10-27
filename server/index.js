var WebSocketServer = require('websocket').server;
var http = require('http');
var parseArgs = require('minimist')
var uuid = require('uuid');

let serverPortPortal = 8080
let serverPortTurtle = 8081
let turtles = {}
let turtlesByUUID = {}
let webservers = []

var serverPortal = http.createServer(function(request, response) {
  console.log((new Date()) + ' Received request for ' + request.url);
  response.writeHead(404);
  response.end();
});

serverPortal.listen(serverPortPortal, function() {
  console.log((new Date()) + ' Server is listening on port ' + serverPortPortal.toString());
});

wsServerPortal = new WebSocketServer({
  httpServer: serverPortal,
  // You should not use autoAcceptConnections for production
  // applications, as it defeats all standard cross-origin protection
  // facilities built into the protocol and the browser.  You should
  // *always* verify the connection's origin and decide whether or not
  // to accept it.
  autoAcceptConnections: false
});

function originIsAllowed(origin) {
  // put logic here to detect whether the specified origin is allowed.
  return true;
}

function parsePortalWSCommands(connection, message) {
  let turtleId = JSON.parse(message)['turtleId']
  let fullMessage = JSON.parse(message)['type']
  let command = fullMessage.split(' ')[0]
  let args = fullMessage.split(' ').slice(1)
  try {
    switch (command) {
      case 'HANDSHAKE':
        webservers.push(connection)
        connection.sendUTF(JSON.stringify({'type':'HANDSHAKE', 'message': {'turtles': Object.keys(turtles)}}))
        break
      default:
        console.log(fullMessage)
        turtles[turtleId].sendUTF(fullMessage)
        break
    }
  } catch (error) {
      
  }
}

wsServerPortal.on('request', function(request) {
  if (!originIsAllowed(request.origin)) {
    // Make sure we only accept requests from an allowed origin
    request.reject();
    console.log((new Date()) + ' Connection from origin ' + request.origin + ' rejected.');
    return;
  }
  
  var connection = request.accept();
  console.log((new Date()) + ' Connection accepted.');
  connection.on('message', function(message) {
    if (message.type === 'utf8') {
      console.log('Received Message: ' + message.utf8Data);
      // connection.sendUTF(message.utf8Data);
      parsePortalWSCommands(connection, message.utf8Data)
    }
    else if (message.type === 'binary') {
      console.log('Received Binary Message of ' + message.binaryData.length + ' bytes');
      connection.sendBytes(message.binaryData);
    }
  });
  connection.on('close', function(reasonCode, description) {
    console.log((new Date()) + ' Peer ' + connection.remoteAddress + ' disconnected.');
  });
});

// =================================================================================
// =================================================================================
// ==================== Turtle Server Below ====================
// =================================================================================
// =================================================================================
var serverTurtle = http.createServer(function(request, response) {
  console.log((new Date()) + ' Received request for ' + request.url);
  response.writeHead(404);
  response.end();
});

serverTurtle.listen(serverPortTurtle, function() {
  console.log((new Date()) + ' Server is listening on port ' + serverPortTurtle.toString());
});

wsServerTurtle = new WebSocketServer({
  httpServer: serverTurtle,
  // You should not use autoAcceptConnections for production
  // applications, as it defeats all standard cross-origin protection
  // facilities built into the protocol and the browser.  You should
  // *always* verify the connection's origin and decide whether or not
  // to accept it.
  autoAcceptConnections: false
});

function originIsAllowed(origin) {
  // put logic here to detect whether the specified origin is allowed.
  return true;
}

function sendToAllPortals(data) {
  for(let i = 0; i < webservers.length; i++) {
    webservers[i].send(data)
  }
}

wsServerTurtle.on('request', function(request) {
  if (!originIsAllowed(request.origin)) {
    // Make sure we only accept requests from an allowed origin
    request.reject();
    console.log((new Date()) + ' Connection from origin ' + request.origin + ' rejected.');
    return;
  }
  
  var connection = request.accept();
  connection.id = uuid.v4();

  console.log((new Date()) + ' Connection accepted.');
  connection.on('message', function(message) {
    if (message.type === 'utf8') {
      console.log('Received Message: ' + message.utf8Data);
      try {
        let jsonMessage = JSON.parse(message.utf8Data)
        let response
        switch (jsonMessage.type) {
          case "HANDSHAKE":
              
            if (typeof(jsonMessage['computerId']) !== 'undefined') {
                // turtles[connection.id] = jsonMessage['computerId']
                turtlesByUUID[connection.id] = jsonMessage['computerId']
                turtles[jsonMessage['computerId']] = connection
            }
            break;
          case "COMMAND_RESPONSE":
            response = {
              'type': 'RESPONSE',
              'message': {
                'data': jsonMessage['response']
              }
            }
            sendToAllPortals(JSON.stringify(response))
            // webservers[0].sendUTF())
            // if (typeof(jsonMessage['computerId']) !== 'undefined') {
            //     turtles[jsonMessage['computerId']] = connection
            // }
            break;
          case "TURTLE_INVENTORY":
            console.log(jsonMessage['response'])
            response = {
              'type': 'INVENTORY',
              'message': {
                'computerId': turtlesByUUID[connection.id],
                'data': jsonMessage['response']
              }
            }
            console.log(response)
            sendToAllPortals(JSON.stringify(response))
            // webservers[0].sendUTF())
            // if (typeof(jsonMessage['computerId']) !== 'undefined') {
            //     turtles[jsonMessage['computerId']] = connection
            // }
            break;
        }
      } catch (error) {
        console.log(error)
      }
      // connection.sendUTF(message.utf8Data);
    }
    else if (message.type === 'binary') {
      console.log('Received Binary Message of ' + message.binaryData.length + ' bytes');
      connection.sendBytes(message.binaryData);
    }
  });
  connection.on('close', function(reasonCode, description) {
    console.log((new Date()) + ' Peer ' + connection.remoteAddress + ' disconnected.');
  });
});