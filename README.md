Portal \ Turtle Commands:

# \Command
`\command [lua commands]`

ex:

```
\command 
-- This returns the contents of a chest attached to the computer
local chest = peripheral.find("minecraft:chest"); 

contents = {}; 

for slot, item in pairs(chest.list()) do
  print(("%d x %s in slot %d"):format(item.count, item.name, slot)) 
  itemDetails = {}
  itemDetails['count']=item.count
  itemDetails['name']=item.name
  contents[slot] = itemDetails
end 
return contents 
```