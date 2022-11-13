Portal \ Turtle Commands:

# \Forward
`\forward`

# \Back
`\back`

# \Up
`\up`

# \Down
`\down`

# \TurnLeft
`\turnLeft`

# \TurnRight
`\turnRight`

# \Dig
`\dig (side)`

# \DigUp
`\digUp (side)`

# \DigDown
`\digDown (side)`

# \Place
`\place (text)`

# \PlaceUp
`\placeUp (text)`

# \PlaceDown
`\placeDown (text)`

# \Drop
`\drop (count)`

# \DropUp
`\dropUp (count)`

# \DropDown
`\dropDown (count)`

# \Select
`\select [slot number]`

# \GetItemCount
`\getItemCount (slot number)`

# \GetItemSpace
`\getItemSpace (slot number)`

# \Detect
`\detect`

# \DetectUp
`\detectUp`

# \DetectDown
`\detect`

# \Compare
`\compare`

# \CompareUp
`\compareUp`

# \CompareDown
`\compareDown`

# \Attack
`\attack (side)`

# \AttackUp
`\attackUp (side)`

# \AttackDown
`\attackDown (side)`

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