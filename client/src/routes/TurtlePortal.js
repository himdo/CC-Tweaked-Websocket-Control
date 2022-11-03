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
  const [selectedSlot, setSelectedSlot] = useState(1);

  (typeof(connectedComputer) !== 'undefined')? turtleInventory = connectedComputer['inventory']: turtleInventory = new Array(turtleInventorySize).fill(undefined);
  
  const [commandText, setCommandText] = useState('');

  function intitalizeTurtleInventoryHTML() {
    return (
      <div>
        <h1>Inventory: </h1>
        <Box sx={{ flexGrow: 1 }}>
          <Grid container spacing={2} style={{justifyContent: 'center'}}>
            {turtleInventory.map((item, index) => {
              return (
                <Grid item xs={3} key={index} style={{border:'solid', backgroundColor: (connectedComputer && (index+1 === parseInt(connectedComputer.selectedSlot)))? 'yellow':'inherit'}}>
                  <span>{(typeof(item) === 'undefined' || item?.name === 'nil')?'undefined': item['name'].toString() + ' x ' + item['count'].toString()}</span>
                </Grid>
              )
            })}
          </Grid>
        </Box>
      </div>
    )
  }

  function intializeTurtleFuelCount() {
    if (connectedComputer && selectedSlot !== connectedComputer.selectedSlot) {
      setSelectedSlot(connectedComputer.selectedSlot)
    }
    return (
      <span style={{justifyContent: 'center'}}>
      Fuel: {(connectedComputer?.fuel)? connectedComputer.fuel: 'N/A'}
      </span>
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
          inputprops={{
            readOnly: true,
          }}
          style={{ width: '90%' }}
          label="Read Only"
          value={serverMostRecentResponse}/>
        <Button onClick={() => {
            sendRefreshMessage()
          }}>Refresh Inventory</Button>
        {intitalizeTurtleInventoryHTML()}
        <br/>
        {intializeTurtleFuelCount()}
      </Box>
    </>
  );
}
  
export default TurtlePortal;
  