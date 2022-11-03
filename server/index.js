var WebSocketServer = require('websocket').server;
var http = require('http');
var parseArgs = require('minimist')
var uuid = require('uuid');
var fs = require('fs')

let serverPortPortal = 8080
let serverPortTurtle = 8081
let worldSavePath='world.json'
let turtleConnectionsByComputerId = {}
let turtlesByUUID = {}
let webservers = []
let world = {}

function sendWorldData() {
  let response = {
    'type': 'WORLD_UPDATE',
    'message': {
      'data': world
    }
  }
  sendToAllPortals(JSON.stringify(response))
}

function saveWorld() {
  fs.writeFileSync(worldSavePath, JSON.stringify(world))
  sendWorldData()
}

function loadWorld() {
  if (fs.existsSync(worldSavePath)) {
    world = JSON.parse(fs.readFileSync(worldSavePath))
  }
}

loadWorld()
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
        let turtleStates = {}
        for(let i = 0; i < Object.keys(turtlesByUUID).length; i++) {
          let info = turtlesByUUID[Object.keys(turtlesByUUID)[i]]
          turtleStates[info['computerID']] = info['state']
        }
        connection.sendUTF(JSON.stringify({'type':'HANDSHAKE', 'message': {'turtleStates': turtleStates}}))
        
        sendWorldData()
        break
      default:
        console.log(fullMessage)
        turtleConnectionsByComputerId[turtleId].sendUTF(fullMessage)
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
              console.log(jsonMessage)
              turtlesByUUID[connection.id] = {'computerID': jsonMessage['computerId'], 'state': jsonMessage['state']}
              turtleConnectionsByComputerId[jsonMessage['computerId']] = connection
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
            break;
          case "TURTLE_INVENTORY":
            response = {
              'type': 'INVENTORY',
              'message': {
                'computerId': turtlesByUUID[connection.id]['computerID'],
                'computerState': turtlesByUUID[connection.id]['state'],
                'data': jsonMessage['response']
              }
            }
            sendToAllPortals(JSON.stringify(response))
            break;
          case "WORLD_UPDATE":
            let xPos=jsonMessage['response']['gps']['x']
            let yPos=jsonMessage['response']['gps']['y']
            let zPos=jsonMessage['response']['gps']['z']
            let heading=jsonMessage['response']['heading']
            let blockNameDown=jsonMessage['response']['down']=='nil'?'minecraft:air':jsonMessage['response']['down']
            let blockNameFront=jsonMessage['response']['front']=='nil'?'minecraft:air':jsonMessage['response']['front']
            let blockNameUp=jsonMessage['response']['up']=='nil'?'minecraft:air':jsonMessage['response']['up']
            console.log(turtlesByUUID[connection.id])

            turtlesByUUID[connection.id]['state'] = {'gps': jsonMessage['response']['gps'], 'heading': jsonMessage['response']['heading']}
            console.log(turtlesByUUID[connection.id])
            // CurrentBlock
            world[xPos+'_'+yPos+'_'+zPos] = {'blockName': 'minecraft:air'}
            // -- heading == 0 -- Not Set
            // -- heading == 1 -- North
            // -- heading == 2 -- East
            // -- heading == 3 -- South
            // -- heading == 4 -- West
            switch(heading) {
              case 1:
                // In front block
                world[xPos+'_'+yPos+'_'+(zPos-1)] = {'blockName': blockNameFront}
                break
              case 2:
                // In front block
                world[(xPos+1)+'_'+yPos+'_'+zPos] = {'blockName': blockNameFront}
                break
              case 3:
                // In front block
                world[xPos+'_'+yPos+'_'+(zPos+1)] = {'blockName': blockNameFront}
                break
              case 4:
                // In front block
                world[(xPos-1)+'_'+yPos+'_'+zPos] = {'blockName': blockNameFront}
                break
            }
            // below block
            world[xPos+'_'+(yPos-1)+'_'+zPos] = {'blockName': blockNameDown}
            // above block
            world[xPos+'_'+(yPos+1)+'_'+zPos] = {'blockName': blockNameUp}

            saveWorld()
            break
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