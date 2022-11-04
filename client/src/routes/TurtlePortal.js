import { Box } from '@mui/system';
import React, { useState } from "react";
import TextField from '@mui/material/TextField';
import { Button, Grid, Menu, MenuItem, TextareaAutosize } from '@mui/material';
//



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
  const [contextMenu, setContextMenu] = React.useState(null);
  const handleContextMenu = (event, index) => {
    event.preventDefault();
    console.log(index)
    setContextMenu(
      contextMenu === null
        ? {
            mouseX: event.clientX + 2,
            mouseY: event.clientY - 6,
            index: index
          }
        : // repeated contextmenu when it is already open closes it with Chrome 84 on Ubuntu
          // Other native context menus might behave different.
          // With this behavior we prevent contextmenu from the backdrop to re-locale existing context menus.
          null,
    );
  };

  const handleClose = () => {
    setContextMenu(null);
  };

  const handleTransferTo = (index) => {
    sendMessageText('\\transferTo ' + index.toString())
    handleClose();
  };

  const handleDrop = (index) => {
    sendMessageText('\\selectAndDrop ' + index.toString())
    handleClose();
  };

  const handleEquipLeft = (index) => {
    sendMessageText('\\equipLeftTo ' + index.toString())
    handleClose();
  };

  const handleEquipRight = (index) => {
    sendMessageText('\\equipRightTo ' + index.toString())
    handleClose();
  };


  const handleRefuel = (index) => {
    sendMessageText('\\refuelAt ' + index.toString())
    handleClose();
  };


  function intitalizeTurtleInventoryHTML() {
    return (
      <div>
        <h1>Inventory: </h1>
        <Box sx={{ flexGrow: 1 }}>
          <Grid container spacing={2} style={{justifyContent: 'center'}}>
            {turtleInventory.map((item, index) => {
              return (
                <Grid item xs={3} key={index} onMouseDown={(e) => _onMouseDown(e, index + 1)} style={{border:'solid', backgroundColor: (connectedComputer && (index+1 === parseInt(connectedComputer.selectedSlot)))? 'yellow':'inherit'}}>
                  <div onContextMenu={(e) => handleContextMenu(e, index)} style={{ cursor: 'context-menu' }}>

                    <div style={{fontSize:'8px', textAlign:'left',marginBottom:'-4px', marginTop:'-8px'}}>{index+1}</div>
                    <span>{(typeof(item) === 'undefined' || item?.name === 'nil')?'undefined': item['name'].toString() + ' x ' + item['count'].toString()}</span>
                    <Menu
                      open={contextMenu !== null && contextMenu.index === index}
                      onClose={handleClose}
                      anchorReference={`anchorPosition`}
                      anchorPosition={
                        contextMenu !== null
                          ? { top: contextMenu.mouseY, left: contextMenu.mouseX }
                          : undefined
                      }
                    >
                      <MenuItem onClick={()=>handleTransferTo(index+1)}>TransferTo</MenuItem>
                      <MenuItem onClick={() => handleDrop(index+1)}>Drop</MenuItem>
                      <MenuItem onClick={()=>handleEquipLeft(index+1)}>Equip Left</MenuItem>
                      <MenuItem onClick={()=>handleEquipRight(index+1)}>Equip Right</MenuItem>
                      <MenuItem onClick={()=>handleRefuel(index+1)}>Refuel</MenuItem>
                    </Menu>
                  </div>
                </Grid>
              )
            })}
          </Grid>
        </Box>
      </div>
    )
  }

  function _onMouseDown(e, index) {
    console.log(e.target.localName )
    if (!(e.target.localName === 'div' || e.target.localName === 'span')) {
      return
    }

    if (e.button === 0) {
      // left click
      sendMessageText('\\select ' + index.toString())
    } else if (e.button === 2) {
      // right click
    }
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
    sendMessageText(commandText)
  }

  function sendMessageText(message) {
    let socketData = {
      'type': message,
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
  