import logo from './logo.svg';
import './App.css';
import { w3cwebsocket as W3CWebSocket } from 'websocket';
import React from 'react';

import { Component } from 'react';
import { Button, Grid } from '@mui/material';
import TurtlePortal from './routes/TurtlePortal';
import ThreeFiberTest from './components/ThreeFiberTest';

class App extends Component {

  state = {
    socket: undefined,
    turtles: {},
    turtleStates: {},
    world: {},
    isLoading: true,
    isConnected: false,
    shouldFadeOut: false,
    message: '',
    attempts: 0,
    name: '',
    connectedTurtle: undefined,
    knownBlocks: {},
    serverMostRecentResponse: ''
  };

  connect() {
    this.setState({ isLoading: true, isConnected: false, shouldFadeOut: false, attempts: 0, message: 'Connecting...' });
    const client = new W3CWebSocket('ws://localhost:8080');
    this.setState({ socket: client });
    client.onopen = () => {
      console.info('[open] Connection established');
      client.send(JSON.stringify({ type: 'HANDSHAKE True' }));
      this.setState({ isLoading: false, isConnected: true, shouldFadeOut: true, attempts: 0, message: 'Connected...' });
    }

    client.onmessage = (msg) => {
      const obj = JSON.parse(msg.data);
      switch (obj.type) {
        case 'HANDSHAKE':
          this.setState({ turtleStates: obj.message.turtleStates });
          break;
          case 'RESPONSE':
            if (typeof(obj.message.data) === 'object') {
              obj.message.data = JSON.stringify(obj.message.data)
            }
            this.setState({serverMostRecentResponse: obj.message.data})
            break
        case 'INVENTORY':
          let turtleLocal = this.state.turtles
          if (!turtleLocal[obj.message.computerId]) {
            turtleLocal[obj.message.computerId] = {}
          }

          turtleLocal[obj.message.computerId]['inventory'] = obj.message.data.inventory
          turtleLocal[obj.message.computerId]['selectedSlot'] = obj.message.data.selectedSlot
          turtleLocal[obj.message.computerId]['fuel'] = obj.message.data.fuel
          this.setState({turtles: turtleLocal})
          break
        case "WORLD_UPDATE":
          this.setState({world: obj.message.data})

          let temp = this.state.knownBlocks
          Object.keys(obj.message.data).map((item,index) => {
            if (!temp[obj.message.data[item]['blockName']]) {
              temp[obj.message.data[item]['blockName']] = {'active': true}
            }
          })
          if (temp !== this.state.knownBlocks) {
            this.setState({knownBlocks: temp})
          }
          break
        case "TURTLE_UPDATE":
          this.setState({ turtleStates: obj.message.data });
          break
        case "INVENTORY_ALL":
          this.setState({ turtles: obj.message.data });
          break
        default:
          console.error('Could not parse websocket message', obj);
          break;
      }
    };

    client.onclose = (e) => {
      if (e.wasClean) {
        console.info(`[close] Connection closed cleanly, code=${e.code} reason=${e.reason}`);
      } else {
        console.warn('[close] Connection died');
      }

      const attempts = this.state.attempts;
      this.setState({ isLoading: false, isConnected: false, message: 'Failed to connect', attempts: attempts + 1 });
      setTimeout(() => {
        this.connect();
      }, 1000 + 1000 * Math.pow(2, Math.min(attempts, 8)));
    };
  };

  connectToTurtle(turtleId) {
    this.setState({connectedTurtle: turtleId})
  }

  componentDidMount() {
    this.connect();
  }

  render() {
    return (
      <div className="App">

        {/* ======================================================== */}
        {/* ======================================================== */}
        {/* ================== Turtle Portal ==================== */}
        {/* ======================================================== */}
        {/* ======================================================== */}
        {
          typeof (this.state.connectedTurtle) != 'undefined'  && 
          <div style={{textAlign: 'left'}}><Button onClick={() => {
            this.connectToTurtle(undefined)
            }}>Back</Button>
          </div>
        }
        {
          typeof (this.state.connectedTurtle) != 'undefined' && 
          <TurtlePortal socket={this.state.socket} connectedTurtle={this.state.connectedTurtle} turtles={this.state.turtles} serverMostRecentResponse={this.state.serverMostRecentResponse} />
        }



        {/* ======================================================== */}
        {/* ======================================================== */}
        {/* ================== Main Menu ==================== */}
        {/* ======================================================== */}
        {/* ======================================================== */}
        {
          !this.state.connectedTurtle &&
          <header className="App-header">
            <img src={logo} className="App-logo" alt="logo" />
            {this.state.turtleStates && <Grid container>
              {Object.keys(this.state.turtleStates).map((item, index) => {
                return (
                <Grid key={index}>
                  <Button onClick={() => {
                    this.connectToTurtle(item)
                    }}>
                    Connect To {item}
                  </Button>
                </Grid>)
                })}
              </Grid>}
          </header>
        }

        <ThreeFiberTest socket={this.state.socket} connectedTurtle={this.state.connectedTurtle} world={this.state.world} knownBlocks={this.state.knownBlocks} turtleStates={this.state.turtleStates}/>
      </div>
    )
  };
}

export default App;
