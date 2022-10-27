function connectToWebsocket() 
    os.sleep(3)
    ws, err = http.websocketAsync('ws://127.0.0.1:8081')
end

function splitString (inputstr, sep)
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

stringtoboolean={ ["true"]=true, ["false"]=false }

function parseWebSocketRecieve(data)
    if string.starts(data, '\\') then
        splitup = splitString(data)
        print(dump(splitup))
        if splitup[1] == '\\forward' then
            ws.send('{"type":"COMMAND_RESPONSE","response":"'.. dump(turtle.forward()) ..'"}')
        elseif splitup[1] == '\\back' then
            ws.send('{"type":"COMMAND_RESPONSE","response":"'.. dump(turtle.back()) ..'"}')
        elseif splitup[1] == '\\up' then
            ws.send('{"type":"COMMAND_RESPONSE","response":"'.. dump(turtle.up()) ..'"}')
        elseif splitup[1] == '\\down' then
            ws.send('{"type":"COMMAND_RESPONSE","response":"'.. dump(turtle.down()) ..'"}')
        elseif splitup[1] == '\\turnLeft' then
            ws.send('{"type":"COMMAND_RESPONSE","response":"'.. dump(turtle.turnLeft()) ..'"}')
        elseif splitup[1] == '\\turnRight' then
            ws.send('{"type":"COMMAND_RESPONSE","response":"'.. dump(turtle.turnRight()) ..'"}')
        elseif splitup[1] == '\\dig' then
            -- this has a optional side param
            if splitup[2] ~= nil then
                ws.send('{"type":"COMMAND_RESPONSE","response":"'.. dump(turtle.dig(splitup[2])) ..'"}')
            else
                ws.send('{"type":"COMMAND_RESPONSE","response":"'.. dump(turtle.dig()) ..'"}')
            end
        elseif splitup[1] == '\\digUp' then
            -- this has a optional side param
            if splitup[2] ~= nil then
                ws.send('{"type":"COMMAND_RESPONSE","response":"'.. dump(turtle.digUp(splitup[2])) ..'"}')
            else
                ws.send('{"type":"COMMAND_RESPONSE","response":"'.. dump(turtle.digUp()) ..'"}')
            end
        elseif splitup[1] == '\\digDown' then
            -- this has a optional side param
            if splitup[2] ~= nil then
                ws.send('{"type":"COMMAND_RESPONSE","response":"'.. dump(turtle.digDown(splitup[2])) ..'"}')
            else
                ws.send('{"type":"COMMAND_RESPONSE","response":"'.. dump(turtle.digDown()) ..'"}')
            end
        elseif splitup[1] == '\\place' then
            -- this has a optional text param
            if splitup[2] ~= nil then
                ws.send('{"type":"COMMAND_RESPONSE","response":"'.. dump(turtle.place(splitup[2])) ..'"}')
            else
                ws.send('{"type":"COMMAND_RESPONSE","response":"'.. dump(turtle.place()) ..'"}')
            end
        elseif splitup[1] == '\\placeUp' then
            -- this has a optional text param
            if splitup[2] ~= nil then
                ws.send('{"type":"COMMAND_RESPONSE","response":"'.. dump(turtle.placeUp(splitup[2])) ..'"}')
            else
                ws.send('{"type":"COMMAND_RESPONSE","response":"'.. dump(turtle.placeUp()) ..'"}')
            end
        elseif splitup[1] == '\\placeDown' then
            -- this has a optional text param
            if splitup[2] ~= nil then
                ws.send('{"type":"COMMAND_RESPONSE","response":"'.. dump(turtle.placeDown(splitup[2])) ..'"}')
            else
                ws.send('{"type":"COMMAND_RESPONSE","response":"'.. dump(turtle.placeDown()) ..'"}')
            end
        elseif splitup[1] == '\\drop' then
            -- this has a optional count param
            if splitup[2] ~= nil then
                ws.send('{"type":"COMMAND_RESPONSE","response":"'.. dump(turtle.drop(tonumber(splitup[2]))) ..'"}')
            else
                ws.send('{"type":"COMMAND_RESPONSE","response":"'.. dump(turtle.drop()) ..'"}')
            end
        elseif splitup[1] == '\\dropUp' then
            -- this has a optional count param
            if splitup[2] ~= nil then
                ws.send('{"type":"COMMAND_RESPONSE","response":"'.. dump(turtle.dropUp(tonumber(splitup[2]))) ..'"}')
            else
                ws.send('{"type":"COMMAND_RESPONSE","response":"'.. dump(turtle.dropUp()) ..'"}')
            end
        elseif splitup[1] == '\\dropDown' then
            -- this has a optional count param
            if splitup[2] ~= nil then
                ws.send('{"type":"COMMAND_RESPONSE","response":"'.. dump(turtle.dropDown(tonumber(splitup[2]))) ..'"}')
            else
                ws.send('{"type":"COMMAND_RESPONSE","response":"'.. dump(turtle.dropDown()) ..'"}')
            end
        elseif splitup[1] == '\\select' then
            -- this has a required slot param
            -- TODO implement param
            if splitup[2] ~= nil then
                ws.send('{"type":"COMMAND_RESPONSE","response":"'.. dump(turtle.select(tonumber(splitup[2]))) ..'"}')
            else
                ws.send('{"type":"COMMAND_RESPONSE","response":"'.. dump(turtle.select(1)) ..'"}')
            end
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
        elseif splitup[1] == '\\suckUp' then
            -- this has a optional count param
            if splitup[2] ~= nil then
                ws.send('{"type":"COMMAND_RESPONSE","response":"'.. dump(turtle.suckUp(tonumber(splitup[2]))) ..'"}')
            else
                ws.send('{"type":"COMMAND_RESPONSE","response":"'.. dump(turtle.suckUp()) ..'"}')
            end
        elseif splitup[1] == '\\suckDown' then
            -- this has a optional count param
            if splitup[2] ~= nil then
                ws.send('{"type":"COMMAND_RESPONSE","response":"'.. dump(turtle.suckDown(tonumber(splitup[2]))) ..'"}')
            else
                ws.send('{"type":"COMMAND_RESPONSE","response":"'.. dump(turtle.suckDown()) ..'"}')
            end
        elseif splitup[1] == '\\getFuelLevel' then
            ws.send('{"type":"COMMAND_RESPONSE","response":"'..dump(turtle.getFuelLevel()) ..'"}')
        elseif splitup[1] == '\\refuel' then
            -- this has a optional count param
            if splitup[2] ~= nil then
                ws.send('{"type":"COMMAND_RESPONSE","response":"'.. dump(turtle.refuel(tonumber(splitup[2]))) ..'"}')
            else
                ws.send('{"type":"COMMAND_RESPONSE","response":"'.. dump(turtle.refuel()) ..'"}')
            end
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
        elseif splitup[1] == '\\getSelectedSlot' then
            ws.send('{"type":"COMMAND_RESPONSE","response":"'.. dump(turtle.getSelectedSlot()) ..'"}')
        elseif splitup[1] == '\\getFuelLimit' then
            ws.send('{"type":"COMMAND_RESPONSE","response":"'.. dump(turtle.getFuelLimit()) ..'"}')
        elseif splitup[1] == '\\equipLeft' then
            ws.send('{"type":"COMMAND_RESPONSE","response":"'.. dump(turtle.equipLeft()) ..'"}')
        elseif splitup[1] == '\\equipRight' then
            ws.send('{"type":"COMMAND_RESPONSE","response":"'.. dump(turtle.equipRight()) ..'"}')
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
        elseif splitup[1] == '\\scanInventory' then
            inventory = {}
            for i=1,16 do
                inventory[i] = dump(turtle.getItemDetail(i))
            end
            ws.send('{"type":"TURTLE_INVENTORY","response":{"inventory":"'.. dump(inventory) ..'","fuel":"'.. dump(turtle.getFuelLevel()) ..'"}}')
        else
            ws.send('{"type":"COMMAND_RESPONSE","response":"UNKNOWN COMMAND"}')
        end
    end
end

function main()
    
    connectToWebsocket()
    while true do
        local e = {os.pullEventRaw()}
        local event = e[1]
        -- print (event)
        if event == "websocket_success" then
            print("Connected!")
            ws = e[3]
            ws.send('{"type":"HANDSHAKE","computerId":' .. os.getComputerID() .. '}')
        elseif event == "websocket_failure" then
            printError("Failed to connect.")
            connectToWebsocket()
        elseif event == "websocket_message" then
            print("Recieved: ")
            parseWebSocketRecieve(e[3])
            print(e[3])
        elseif event == "websocket_closed" then
            printError("Server closed.")
            connectToWebsocket()
        elseif event == "terminate" then
            ws.close()
            print("Closing socket")
            break
        end
    end
end

main()