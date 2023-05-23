state = nil
-- {
--     heading = 0
-- }
-- heading == 0 -- Not Set
-- heading == 1 -- North
-- heading == 2 -- East
-- heading == 3 -- South
-- heading == 4 -- West

settingsPath = '.settings'
headingToString={[0]='N/A', [1]='North', [2]='East', [3]='South', [4]='West'}

function saveState()
    local file = fs.open(settingsPath, 'w')
    file.write(textutils.serialize(state))
    file.close()
end

function loadState()
    if fs.exists(settingsPath) then
        local file = fs.open(settingsPath, 'r')
        local contents = file.readAll()
        file.close()
        state = textutils.unserialize(contents)
    else
        local file = fs.open(settingsPath, 'w')
        file.close()
    end
end

function connectToWebsocket() 
    os.sleep(3)
    ws, err = http.websocketAsync('ws://127.0.0.1:8081')
end

function getHeading(forceNew)
    if (forceNew ~= true) then
        if state['heading'] ~= 0 then
            return state['heading']
        end
    end

    local x1, _, z1 = gps.locate()

    local moved, _ = turtle.forward()
    if (moved == false) then
        turtle.dig()
        moved, _ = turtle.forward()
        if moved == false then
            state['heading'] = 0
            saveState()
            return
        end
    end
    local x2, _, z2 = gps.locate()
    if z1 > z2 then
        state['heading'] = 1
    elseif z2 > z1 then
        state['heading'] = 3
    elseif x1 > x2 then
        state['heading'] = 4
    elseif x2 > x1 then
        state['heading'] = 2
    end
    saveState()
end

function getGPS(forceNew)
    if (forceNew ~= true) then
        if state['gps'] ~= nil then
            return state['gps']
        end
    end

    x, y, z = gps.locate()
    state['gps'] = {['x']=x,['y']=y,['z']=z}
    saveState()
end

function splitString(inputstr, sep)
    if sep == nil then
            sep = "%s"
    end
    local t={}
    for str in string.gmatch(inputstr, "([^"..sep.."]+)") do
            table.insert(t, str)
    end
    return t
end

function string.starts(String,Start)
    return string.sub(String,1,string.len(Start))==Start
end

function dump(o)
    if type(o) == 'table' then
       local s = '{ '
       for k,v in pairs(o) do
          if type(k) ~= 'number' then k = "'"..k.."'" end
          s = s .. '['..k..'] =' .. dump(v) .. ','
       end
       return s .. '} '
    else
       return tostring(o)
    end
end

function getVisisbleBlocks()
    _, dataDown = turtle.inspectDown()
    _, dataFront = turtle.inspect()
    _, dataUp = turtle.inspectUp()
    return dataDown["name"], dataFront["name"], dataUp["name"]
end

function up() 
    moved, _ = turtle.up()
    if (moved) then
        state['gps']['y'] = state['gps']['y'] + 1
        saveState()
    end
    return moved
end

function down() 
    moved, _ = turtle.down()
    if (moved) then
        state['gps']['y'] = state['gps']['y'] - 1
        saveState()
    end
    return moved
end

function forward()
    moved, _ = turtle.forward()
    if (moved) then
        if state['heading'] == 1 then
            state['gps']['z'] = state['gps']['z'] - 1
        elseif state['heading'] == 2 then
            state['gps']['x'] = state['gps']['x'] + 1
        elseif state['heading'] == 3 then
            state['gps']['z'] = state['gps']['z'] + 1
        elseif state['heading'] == 4 then
            state['gps']['x'] = state['gps']['x'] - 1
        end
        saveState()
    end
    return moved
end

function back()
    moved, _ = turtle.back()
    if (moved) then
        if state['heading'] == 1 then
            state['gps']['z'] = state['gps']['z'] + 1
        elseif state['heading'] == 2 then
            state['gps']['x'] = state['gps']['x'] - 1
        elseif state['heading'] == 3 then
            state['gps']['z'] = state['gps']['z'] - 1
        elseif state['heading'] == 4 then
            state['gps']['x'] = state['gps']['x'] + 1
        end
        saveState()
    end
    return moved
end

function turnLeft()
    worked, _ = turtle.turnLeft()
    if worked then
        local newHeading = state['heading'] - 1
        if newHeading == 0 then
            newHeading = 4
        end
        state['heading'] = newHeading
        saveState()
    end
    return worked
end

function turnRight()
    worked, _ = turtle.turnRight()
    if worked then
        local newHeading = state['heading'] + 1
        if newHeading == 5 then
            newHeading = 1
        end
        
        state['heading'] = newHeading
        saveState()
    end
    return worked
end
stringtoboolean={ ["true"]=true, ["false"]=false }

function parseWebSocketRecieve(data)
    if string.starts(data, '\\') then
        splitup = splitString(data)
        if splitup[1] == '\\forward' then
            ws.send('{"type":"COMMAND_RESPONSE","response":"'.. dump(forward()) ..'"}')
            sendWorldUpdate()
        elseif splitup[1] == '\\back' then
            ws.send('{"type":"COMMAND_RESPONSE","response":"'.. dump(back()) ..'"}')
            sendWorldUpdate()
        elseif splitup[1] == '\\up' then
            ws.send('{"type":"COMMAND_RESPONSE","response":"'.. dump(up()) ..'"}')
            sendWorldUpdate()
        elseif splitup[1] == '\\down' then
            ws.send('{"type":"COMMAND_RESPONSE","response":"'.. dump(down()) ..'"}')
            sendWorldUpdate()
        elseif splitup[1] == '\\turnLeft' then
            ws.send('{"type":"COMMAND_RESPONSE","response":"'.. dump(turnLeft()) ..'"}')
            sendWorldUpdate()
        elseif splitup[1] == '\\turnRight' then
            ws.send('{"type":"COMMAND_RESPONSE","response":"'.. dump(turnRight()) ..'"}')
            sendWorldUpdate()
        elseif splitup[1] == '\\dig' then
            -- this has a optional side param
            if splitup[2] ~= nil then
                ws.send('{"type":"COMMAND_RESPONSE","response":"'.. dump(turtle.dig(splitup[2])) ..'"}')
            else
                ws.send('{"type":"COMMAND_RESPONSE","response":"'.. dump(turtle.dig()) ..'"}')
            end
            sendWorldUpdate()
            sendScanInventory()
        elseif splitup[1] == '\\digUp' then
            -- this has a optional side param
            if splitup[2] ~= nil then
                ws.send('{"type":"COMMAND_RESPONSE","response":"'.. dump(turtle.digUp(splitup[2])) ..'"}')
            else
                ws.send('{"type":"COMMAND_RESPONSE","response":"'.. dump(turtle.digUp()) ..'"}')
            end
            sendWorldUpdate()
            sendScanInventory()
        elseif splitup[1] == '\\digDown' then
            -- this has a optional side param
            if splitup[2] ~= nil then
                ws.send('{"type":"COMMAND_RESPONSE","response":"'.. dump(turtle.digDown(splitup[2])) ..'"}')
            else
                ws.send('{"type":"COMMAND_RESPONSE","response":"'.. dump(turtle.digDown()) ..'"}')
            end
            sendWorldUpdate()
            sendScanInventory()
        elseif splitup[1] == '\\place' then
            -- this has a optional text param
            if splitup[2] ~= nil then
                ws.send('{"type":"COMMAND_RESPONSE","response":"'.. dump(turtle.place(splitup[2])) ..'"}')
            else
                ws.send('{"type":"COMMAND_RESPONSE","response":"'.. dump(turtle.place()) ..'"}')
            end
            sendWorldUpdate()
            sendScanInventory()
        elseif splitup[1] == '\\placeUp' then
            -- this has a optional text param
            if splitup[2] ~= nil then
                ws.send('{"type":"COMMAND_RESPONSE","response":"'.. dump(turtle.placeUp(splitup[2])) ..'"}')
            else
                ws.send('{"type":"COMMAND_RESPONSE","response":"'.. dump(turtle.placeUp()) ..'"}')
            end
            sendWorldUpdate()
            sendScanInventory()
        elseif splitup[1] == '\\placeDown' then
            -- this has a optional text param
            if splitup[2] ~= nil then
                ws.send('{"type":"COMMAND_RESPONSE","response":"'.. dump(turtle.placeDown(splitup[2])) ..'"}')
            else
                ws.send('{"type":"COMMAND_RESPONSE","response":"'.. dump(turtle.placeDown()) ..'"}')
            end
            sendWorldUpdate()
            sendScanInventory()
        elseif splitup[1] == '\\drop' then
            -- this has a optional count param
            if splitup[2] ~= nil then
                ws.send('{"type":"COMMAND_RESPONSE","response":"'.. dump(turtle.drop(tonumber(splitup[2]))) ..'"}')
            else
                ws.send('{"type":"COMMAND_RESPONSE","response":"'.. dump(turtle.drop()) ..'"}')
            end
            sendScanInventory()
        elseif splitup[1] == '\\dropUp' then
            -- this has a optional count param
            if splitup[2] ~= nil then
                ws.send('{"type":"COMMAND_RESPONSE","response":"'.. dump(turtle.dropUp(tonumber(splitup[2]))) ..'"}')
            else
                ws.send('{"type":"COMMAND_RESPONSE","response":"'.. dump(turtle.dropUp()) ..'"}')
            end
            sendScanInventory()
        elseif splitup[1] == '\\dropDown' then
            -- this has a optional count param
            if splitup[2] ~= nil then
                ws.send('{"type":"COMMAND_RESPONSE","response":"'.. dump(turtle.dropDown(tonumber(splitup[2]))) ..'"}')
            else
                ws.send('{"type":"COMMAND_RESPONSE","response":"'.. dump(turtle.dropDown()) ..'"}')
            end
            sendScanInventory()
        elseif splitup[1] == '\\select' then
            -- this has a required slot param
            -- TODO implement param
            if splitup[2] ~= nil then
                ws.send('{"type":"COMMAND_RESPONSE","response":"'.. dump(turtle.select(tonumber(splitup[2]))) ..'"}')
            else
                ws.send('{"type":"COMMAND_RESPONSE","response":"'.. dump(turtle.select(1)) ..'"}')
            end
            sendScanInventory()
        elseif splitup[1] == '\\getItemCount' then
            -- this has a optional slot param
            if splitup[2] ~= nil then
                ws.send('{"type":"COMMAND_RESPONSE","response":"'.. dump(turtle.getItemCount(tonumber(splitup[2]))) ..'"}')
            else
                ws.send('{"type":"COMMAND_RESPONSE","response":"'.. dump(turtle.getItemCount()) ..'"}')
            end
        elseif splitup[1] == '\\getItemSpace' then
            -- this has a optional slot param
            if splitup[2] ~= nil then
                ws.send('{"type":"COMMAND_RESPONSE","response":"'.. dump(turtle.getItemSpace(tonumber(splitup[2]))) ..'"}')
            else
                ws.send('{"type":"COMMAND_RESPONSE","response":"'.. dump(turtle.getItemSpace()) ..'"}')
            end
        elseif splitup[1] == '\\detect' then
            ws.send('{"type":"COMMAND_RESPONSE","response":"'.. dump(turtle.detect()) ..'"}')
        elseif splitup[1] == '\\detectUp' then
            ws.send('{"type":"COMMAND_RESPONSE","response":"'.. dump(turtle.detectUp()) ..'"}')
        elseif splitup[1] == '\\detectDown' then
            ws.send('{"type":"COMMAND_RESPONSE","response":"'.. dump(turtle.detectDown()) ..'"}')
        elseif splitup[1] == '\\compare' then
            ws.send('{"type":"COMMAND_RESPONSE","response":"'.. dump(turtle.compare()) ..'"}')
        elseif splitup[1] == '\\compareUp' then
            ws.send('{"type":"COMMAND_RESPONSE","response":"'.. dump(turtle.compareUp()) ..'"}')
        elseif splitup[1] == '\\compareDown' then
            ws.send('{"type":"COMMAND_RESPONSE","response":"'.. dump(turtle.compareDown()) ..'"}')
        elseif splitup[1] == '\\attack' then
            -- this has a optional side param
            if splitup[2] ~= nil then
                ws.send('{"type":"COMMAND_RESPONSE","response":"'.. dump(turtle.attack(splitup[2])) ..'"}')
            else
                ws.send('{"type":"COMMAND_RESPONSE","response":"'.. dump(turtle.attack()) ..'"}')
            end
        elseif splitup[1] == '\\attackUp' then
            -- this has a optional side param
            if splitup[2] ~= nil then
                ws.send('{"type":"COMMAND_RESPONSE","response":"'.. dump(turtle.attackUp(splitup[2])) ..'"}')
            else
                ws.send('{"type":"COMMAND_RESPONSE","response":"'.. dump(turtle.attackUp()) ..'"}')
            end
        elseif splitup[1] == '\\attackDown' then
            -- this has a optional side param
            if splitup[2] ~= nil then
                ws.send('{"type":"COMMAND_RESPONSE","response":"'.. dump(turtle.attackDown(splitup[2])) ..'"}')
            else
                ws.send('{"type":"COMMAND_RESPONSE","response":"'.. dump(turtle.attackDown()) ..'"}')
            end
        elseif splitup[1] == '\\suck' then
            -- this has a optional count param
            if splitup[2] ~= nil then
                ws.send('{"type":"COMMAND_RESPONSE","response":"'.. dump(turtle.suck(tonumber(splitup[2]))) ..'"}')
            else
                ws.send('{"type":"COMMAND_RESPONSE","response":"'.. dump(turtle.suck()) ..'"}')
            end
            sendScanInventory()
        elseif splitup[1] == '\\suckUp' then
            -- this has a optional count param
            if splitup[2] ~= nil then
                ws.send('{"type":"COMMAND_RESPONSE","response":"'.. dump(turtle.suckUp(tonumber(splitup[2]))) ..'"}')
            else
                ws.send('{"type":"COMMAND_RESPONSE","response":"'.. dump(turtle.suckUp()) ..'"}')
            end
            sendScanInventory()
        elseif splitup[1] == '\\suckDown' then
            -- this has a optional count param
            if splitup[2] ~= nil then
                ws.send('{"type":"COMMAND_RESPONSE","response":"'.. dump(turtle.suckDown(tonumber(splitup[2]))) ..'"}')
            else
                ws.send('{"type":"COMMAND_RESPONSE","response":"'.. dump(turtle.suckDown()) ..'"}')
            end
            sendScanInventory()
        elseif splitup[1] == '\\getFuelLevel' then
            ws.send('{"type":"COMMAND_RESPONSE","response":"'..dump(turtle.getFuelLevel()) ..'"}')
        elseif splitup[1] == '\\refuel' then
            -- this has a optional count param
            if splitup[2] ~= nil then
                ws.send('{"type":"COMMAND_RESPONSE","response":"'.. dump(turtle.refuel(tonumber(splitup[2]))) ..'"}')
            else
                ws.send('{"type":"COMMAND_RESPONSE","response":"'.. dump(turtle.refuel()) ..'"}')
            end
            sendScanInventory()
        elseif splitup[1] == '\\compareTo' then
            -- this has a required slot param
            if splitup[2] ~= nil then
                ws.send('{"type":"COMMAND_RESPONSE","response":"'.. dump(turtle.compareTo(tonumber(splitup[2]))) ..'"}')
            else
                ws.send('{"type":"COMMAND_RESPONSE","response":"'.. dump(turtle.compareTo(1)) ..'"}')
            end
        elseif splitup[1] == '\\transferTo' then
            -- this has a required slot param and an optional param count
            if splitup[3] ~= nil then
                ws.send('{"type":"COMMAND_RESPONSE","response":"'.. dump(turtle.transferTo(tonumber(splitup[2]), tonumber(splitup[3]))) ..'"}')
            elseif splitup[2] ~= nil then
                ws.send('{"type":"COMMAND_RESPONSE","response":"'.. dump(turtle.transferTo(tonumber(splitup[2]))) ..'"}')
            else
                ws.send('{"type":"COMMAND_RESPONSE","response":"'.. dump(turtle.transferTo(1)) ..'"}')
            end
            sendScanInventory()
        elseif splitup[1] == '\\getSelectedSlot' then
            ws.send('{"type":"COMMAND_RESPONSE","response":"'.. dump(turtle.getSelectedSlot()) ..'"}')
        elseif splitup[1] == '\\getFuelLimit' then
            ws.send('{"type":"COMMAND_RESPONSE","response":"'.. dump(turtle.getFuelLimit()) ..'"}')
        elseif splitup[1] == '\\equipLeft' then
            ws.send('{"type":"COMMAND_RESPONSE","response":"'.. dump(turtle.equipLeft()) ..'"}')
            sendScanInventory()
        elseif splitup[1] == '\\equipRight' then
            ws.send('{"type":"COMMAND_RESPONSE","response":"'.. dump(turtle.equipRight()) ..'"}')
            sendScanInventory()
        elseif splitup[1] == '\\inspect' then
            _, data = turtle.inspect()
            ws.send('{"type":"COMMAND_RESPONSE","response":"'.. dump(data["name"]) ..'"}')
        elseif splitup[1] == '\\inspectUp' then
            _, data = turtle.inspectUp()
            ws.send('{"type":"COMMAND_RESPONSE","response":"'.. dump(data["name"]) ..'"}')
        elseif splitup[1] == '\\inspectDown' then
            _, data = turtle.inspectDown()
            ws.send('{"type":"COMMAND_RESPONSE","response":"'.. dump(data["name"]) ..'"}')
        elseif splitup[1] == '\\getItemDetail' then
            -- this has a optional slot param, and if side is provied a optional detailed param
            
            if splitup[3] ~= nil then
                ws.send('{"type":"COMMAND_RESPONSE","response":"'.. dump(turtle.getItemDetail(tonumber(splitup[2]), stringtoboolean[splitup[3]])) ..'"}')
            elseif splitup[2] ~= nil then
                ws.send('{"type":"COMMAND_RESPONSE","response":"'.. dump(turtle.getItemDetail(tonumber(splitup[2]))) ..'"}')
            else
                ws.send('{"type":"COMMAND_RESPONSE","response":"'.. dump(turtle.getItemDetail()) ..'"}')
            end
        elseif splitup[1] == '\\craft' then
            -- this has a optional limit param
            if splitup[2] ~= nil then
                ws.send('{"type":"COMMAND_RESPONSE","response":"'.. dump(turtle.craft(tonumber(splitup[2]))) ..'"}')
            else
                ws.send('{"type":"COMMAND_RESPONSE","response":"'.. dump(turtle.craft()) ..'"}')
            end
            sendScanInventory()
        elseif splitup[1] == '\\scanInventory' then
            sendScanInventory()
        elseif splitup[1] == '\\scanVisible' then
            nameDown, nameFront, nameUp = getVisisbleBlocks()
            sendWorldUpdate()
            ws.send('{"type":"COMMAND_RESPONSE","response":{"down":"'.. dump(nameDown) ..'", "front":"'.. dump(nameFront) ..'","up":"'.. dump(nameUp) ..'","heading":'..dump(state['heading'])..',"gps":'..textutils.serializeJSON(state['gps'])..'}}')
        elseif splitup[1] == '\\printState' then
            ws.send('{"type":"COMMAND_RESPONSE","response":'.. dump(textutils.serializeJSON(state)) ..'}')
        elseif splitup[1] == '\\selectAndDrop' then
            selectedSlot = turtle.getSelectedSlot()
            turtle.select(tonumber(splitup[2]))
            turtle.drop()
            turtle.select(selectedSlot)
            ws.send('{"type":"COMMAND_RESPONSE","response":"true"}')
            sendScanInventory()
        elseif splitup[1] == '\\selectAndDropUp' then
            selectedSlot = turtle.getSelectedSlot()
            turtle.select(tonumber(splitup[2]))
            turtle.dropUp()
            turtle.select(selectedSlot)
            ws.send('{"type":"COMMAND_RESPONSE","response":"true"}')
            sendScanInventory()
        elseif splitup[1] == '\\selectAndDropDown' then
            selectedSlot = turtle.getSelectedSlot()
            turtle.select(tonumber(splitup[2]))
            turtle.dropDown()
            turtle.select(selectedSlot)
            ws.send('{"type":"COMMAND_RESPONSE","response":"true"}')
            sendScanInventory()
        elseif splitup[1] == '\\equipLeftTo' then
            selectedSlot = turtle.getSelectedSlot()
            turtle.select(tonumber(splitup[2]))
            status = turtle.equipLeft()
            turtle.select(selectedSlot)
            
            ws.send('{"type":"COMMAND_RESPONSE","response":"'.. dump(status) ..'"}')
            sendScanInventory()
        elseif splitup[1] == '\\equipRightTo' then
            selectedSlot = turtle.getSelectedSlot()
            turtle.select(tonumber(splitup[2]))
            status = turtle.equipRight()
            turtle.select(selectedSlot)
            
            ws.send('{"type":"COMMAND_RESPONSE","response":"'.. dump(status) ..'"}')
            sendScanInventory()
        elseif splitup[1] == '\\selectAndPlace' then
            selectedSlot = turtle.getSelectedSlot()
            turtle.select(tonumber(splitup[2]))
            status = turtle.place()
            turtle.select(selectedSlot)
            sendScanInventory()
            sendWorldUpdate()
            ws.send('{"type":"COMMAND_RESPONSE","response":"' .. dump(status) .. '"}')
        elseif splitup[1] == '\\selectAndPlaceUp' then
            selectedSlot = turtle.getSelectedSlot()
            turtle.select(tonumber(splitup[2]))
            status = turtle.placeUp()
            turtle.select(selectedSlot)
            sendScanInventory()
            sendWorldUpdate()
            ws.send('{"type":"COMMAND_RESPONSE","response":"' .. dump(status) .. '"}')
        elseif splitup[1] == '\\selectAndPlaceDown' then
            selectedSlot = turtle.getSelectedSlot()
            turtle.select(tonumber(splitup[2]))
            status = turtle.placeDown()
            turtle.select(selectedSlot)
            sendScanInventory()
            sendWorldUpdate()
            ws.send('{"type":"COMMAND_RESPONSE","response":"' .. dump(status) .. '"}')
        elseif splitup[1] == '\\refuelAt' then
            selectedSlot = turtle.getSelectedSlot()
            turtle.select(tonumber(splitup[2]))
            status = turtle.refuel()
            turtle.select(selectedSlot)
            
            ws.send('{"type":"COMMAND_RESPONSE","response":"'.. dump(status) ..'"}')
            sendScanInventory()
        elseif splitup[1] == '\\command' then
            local commandToExecute = string.gsub(data, '\\command ','')
            status, res = pcall(loadstring(commandToExecute))
            ws.send('{"type":"COMMAND_RESPONSE","response":{"status":"'.. dump(status) ..'","response":"' .. dump(res) .. '"}}')
        elseif splitup[1] == '\\ping' then
            ws.send('{"type":"COMMAND_RESPONSE","response":"pong"}')
        else
            ws.send('{"type":"COMMAND_RESPONSE","response":"UNKNOWN COMMAND"}')
        end
    end
end

function sendScanInventory()
    inventory = {}
    for i=1,16 do
        details = turtle.getItemDetail(i)
        if not details then
            default={}
            default['name']="nil"
            default["count"]=0
            table.insert(inventory, default)
        else 
            table.insert(inventory,  details)
        end
    end
    ws.send('{"type":"TURTLE_INVENTORY","response":{"inventory":'.. dump(textutils.serializeJSON(inventory)) ..',"fuel":"'.. dump(turtle.getFuelLevel()) ..'","maxFuel":"'.. dump(turtle.getFuelLimit()) ..'","selectedSlot":"' .. dump(turtle.getSelectedSlot()) .. '"}}')
end

function sendWorldUpdate()
    nameDown, nameFront, nameUp = getVisisbleBlocks()
    ws.send('{"type":"WORLD_UPDATE","response":{"down":"'.. dump(nameDown) ..'", "front":"'.. dump(nameFront) ..'","up":"'.. dump(nameUp) ..'","heading":'..dump(state['heading'])..',"gps":'..textutils.serializeJSON(state['gps'])..'}}')
end

function main()
    loadState()
    if (state['gps'] == nil or state['heading'] == 0) then
        getHeading(true)
    end
    if (state['gps'] == nil) then
        getGPS()
    end
    connectToWebsocket()
    while true do
        local e = {os.pullEventRaw()}
        local event = e[1]
        if event == "websocket_success" then
            print("Connected!")
            ws = e[3]
            ws.send('{"type":"HANDSHAKE","computerId":' .. os.getComputerID() .. ', "state":' .. dump(textutils.serializeJSON(state)) ..'}')
        elseif event == "websocket_failure" then
            printError("Failed to connect.")
            connectToWebsocket()
        elseif event == "websocket_message" then
            print("Recieved: ")
            print(e[3])
            status, res = pcall(parseWebSocketRecieve, e[3])
            if status == false then
                ws.send('{"type":"COMMAND_RESPONSE","response":"COMMAND ERROR: ' ..dump(res)..'"}')
            end
        elseif event == "websocket_closed" then
            printError("Server closed.")
            connectToWebsocket()
        elseif event == "terminate" then
            ws.close()
            print("Closing socket")
            break
        elseif event == "turtle_inventory" then
            if ws ~= nil then
                sendScanInventory()
            end
        end
    end
end

main()