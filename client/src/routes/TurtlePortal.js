import { Box } from '@mui/system';
import React, { useState } from "react";
import TextField from '@mui/material/TextField';
import { Button, Grid, TextareaAutosize } from '@mui/material';
// \getFuelLevel
function TurtlePortal(props) {
  let socket = props.socket
  let connectedTurtle = props.connectedTurtle
  let turtles = props.turtles
  let serverMostRecentResponse = props.serverMostRecentResponse
  let turtleInventorySize = 16
  let turtleInventory;
  let connectedComputer = turtles[connectedTurtle];
  (typeof(connectedComputer) !== 'undefined')? turtleInventory = connectedComputer['inventory']: turtleInventory = new Array(turtleInventorySize).fill(undefined);
  
  const [commandText, setCommandText] = useState('');

  function turtleRow(row) {
    return (
      <React.Fragment>
        <Grid item xs={3}>
          <div>{(typeof(turtleInventory[(row*4)]) === 'undefined' || turtleInventory[(row*4)]?.name === 'nil')?'undefined': turtleInventory[(row*4)]['name'].toString() + ' x ' + turtleInventory[(row*4)]['count'].toString()}</div>
        </Grid>
        <Grid item xs={3}>
          <div>{(typeof(turtleInventory[(row*4)+1]) === 'undefined' || turtleInventory[(row*4)+1]?.name === 'nil')?'undefined': turtleInventory[(row*4)+1]['name'].toString() + ' x ' + turtleInventory[(row*4)+1]['count'].toString()}</div>
        </Grid>
        <Grid item xs={3}>
          <div>{(typeof(turtleInventory[(row*4)+2]) === 'undefined' || turtleInventory[(row*4)+2]?.name === 'nil')?'undefined': turtleInventory[(row*4)+2]['name'].toString() + ' x ' + turtleInventory[(row*4)+2]['count'].toString()}</div>
        </Grid>
        <Grid item xs={3}>
          <div>{(typeof(turtleInventory[(row*4)+3]) === 'undefined' || turtleInventory[(row*4)+3]?.name === 'nil')?'undefined': turtleInventory[(row*4)+3]['name'].toString() + ' x ' + turtleInventory[(row*4)+3]['count'].toString()}</div>
        </Grid>
      </React.Fragment>
    )
  }

  function intitalizeTurtleInventoryHTML() {
    return (
      <div>
        <h1>Inventory: </h1>
        <Box sx={{ flexGrow: 1 }}>
          <Grid container spacing={1}>
            <Grid container item spacing={4}>
              {turtleRow(0)}
            </Grid>
            <Grid container item spacing={4}>
              {turtleRow(1)}
            </Grid>
            <Grid container item spacing={4}>
              {turtleRow(2)}
            </Grid>
            <Grid container item spacing={4}>
              {turtleRow(3)}
            </Grid>
          </Grid>
        </Box>
      </div>
    )
  }

  function intializeTurtleFuelCount() {
    console.log(connectedComputer)
    return (
      <>
      Fuel: {(connectedComputer?.fuel)? connectedComputer.fuel: 'N/A'}
      </>
    )
  }
  function handleChange (event) {
    setCommandText(event.target.value)
  };
  
  function sendMessage() {
    let socketData = {
      'type': commandText,
      'turtleId': connectedTurtle
    }
    socket.send(JSON.stringify(socketData))
  }

  function sendRefreshMessage() {
    let socketData = {
      'type': '\\scanInventory',
      'turtleId': connectedTurtle
    }
    socket.send(JSON.stringify(socketData))
  }

  return (
    <>
      <Box sx={{ minHeight: '100vh' }}>
        <TextField
          value={commandText}
          onChange={handleChange}/>
        <Button
          onClick={() => {
            sendMessage()
          }}
        >Submit</Button>
        
        <TextareaAutosize
          InputProps={{
            readOnly: true,
          }}
          style={{ width: '90%' }}
          label="Read Only"
          value={serverMostRecentResponse}/>
        <Button onClick={() => {
            sendRefreshMessage()
          }}>Refresh Inventory</Button>
        {intitalizeTurtleInventoryHTML()}
        {intializeTurtleFuelCount()}
      </Box>
    </>
  );
}
  
export default TurtlePortal;
  