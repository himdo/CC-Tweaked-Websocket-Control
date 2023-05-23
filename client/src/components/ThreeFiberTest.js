import React, { Component, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame, useLoader, useThree } from '@react-three/fiber'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import Color from 'color';
import { AxesHelper, Euler, MeshLambertMaterial, Quaternion, Vector3 } from 'three';
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';
import { Text } from '@react-three/drei';
import "./ReactThreeCanvas.css"
import { Tooltip } from '@mui/material';

function createNewControls(camera, gl, position) {
  let controls = new OrbitControls(camera, gl.domElement);

  controls.minDistance = 3;
  controls.maxDistance = 20;
  controls.target = new Vector3(position[0], position[1], position[2])
  return controls
}

const CameraController = (props) => {
  const { camera, gl } = useThree();
  useEffect(
    () => {
      let controls = createNewControls(camera, gl, [0,0,0])
      props.setControls(controls)
      return () => {
        controls.dispose();
      };
    },
    [camera, gl]
  );
  return null;
};

function onClickBox(args) {
  args.controls.target = new Vector3(parseInt(args.position[0]),parseInt(args.position[1]),parseInt(args.position[2]))
  args.controls.update(true)
  args.setControls(args.controls)
}

function onPointerOverBox(args) {
  args.setProp(args.text)
}

function onPointerOutBox(args) {
  args.setProp(args.text)
}

function Box(props) {
  const mesh = useRef(null)
  const [hovered, setHover] = useState(false)
  const [active, setActive] = useState(false)
  // useFrame((state, delta) => (mesh.current.rotation.x += 0.01))
  return (
    <mesh
      {...props}
      ref={mesh}
      // onPointerDown={console.log}
      // scale={active ? 1.5 : 1}
      onClick={(event) => {onClickBox({name: props.name, position: props.position, controls: props.controls, setControls: props.setControls})}}
      onPointerOver={(event) => onPointerOverBox({setProp: props.setToolTipText, text: props.name})}
      onPointerOut={(event) => onPointerOutBox({setProp: props.setToolTipText, text: ''})}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color={props.color} transparent={props.transparent} opacity={props.transparent ? (typeof (props.opacity) !== 'undefined' ? props.opacity : 0.5) : 1}/>
    </mesh>
  )
}

function Compass(props) {
  let cameraPosition = props.controls?.target
  let cameraPositionX = 0
  let cameraPositionY = 0
  let cameraPositionZ = 0
  if (cameraPosition) {
    cameraPositionX = cameraPosition.x
    cameraPositionY = cameraPosition.y
    cameraPositionZ = cameraPosition.z
  }
  return (
    <>
      <primitive position={[cameraPositionX, cameraPositionY, cameraPositionZ]} object={new AxesHelper(10)} />
      <Text scale={[10, 10, 10]} position={[cameraPositionX - 10, cameraPositionY, cameraPositionZ]}>
        North
      </Text>
      <Text scale={[10, 10, 10]} position={[cameraPositionX + 10, cameraPositionY, cameraPositionZ]}>
        South
      </Text>
      <Text scale={[10, 10, 10]} position={[cameraPositionX, cameraPositionY, cameraPositionZ + 10]}>
        East
      </Text>
      <Text scale={[10, 10, 10]} position={[cameraPositionX, cameraPositionY, cameraPositionZ - 10]}>
        West
      </Text>
    </>
  )
}

function useInterpolate(property, position, rotation) {
	const ref = useRef(null);
	useFrame(() => {
		if (ref.current) {
			const current = ref.current[property];
			const newPos = current.lerp(new Vector3(position[0], position[1], position[2]), 0.3);
			ref.current[property].x = newPos.x;
			ref.current[property].y = newPos.y;
			ref.current[property].z = newPos.z;
			if (rotation) {
				const currentR = ref.current.quaternion;
				const targetR = new Quaternion();
				targetR.setFromEuler(new Euler(rotation[0], rotation[1], rotation[2]));
				const newRot = currentR.slerp(targetR, 0.3);
				ref.current.rotation.setFromQuaternion(newRot);
			}
		}
	});
	return ref;
}

function Model({ url, position, rotation, name }) {
	const GLTFLoader = require('three/examples/jsm/loaders/GLTFLoader').GLTFLoader;
	const obj = useLoader(GLTFLoader, url);
	const ref = useInterpolate('position', position, rotation);
	return (
		<>
			<mesh
				visible={false}
				position={position}
				name={name}
				scale={[1, 1, 1]}
			>
				<boxBufferGeometry args={[1, 1, 1]} />
			</mesh>
			<primitive ref={ref} object={obj.scene} />
		</>
	);
}

function OtherTurtles({ turtles, switchTurtle }) {
	const GLTFLoader = require('three/examples/jsm/loaders/GLTFLoader').GLTFLoader;
	const obj = useLoader(GLTFLoader, "/otherturtle.glb");

	return (
		<>
			{turtles.map((turtle) => <OtherTurtle key={turtle.id} turtle={turtle} obj={obj} switchTurtle={switchTurtle} />)}
		</>
	);
}

function OtherTurtle({ obj, turtle, switchTurtle }) {
	const geom = useMemo(() => obj.scene.clone(true), []);
  let position = turtle['gps']
  let heading = 0
  switch (turtle['heading']) {
    case 1:
      heading = 1
      break;
    case 2:
      heading = 4
      break;
    case 3:
      heading = 3
      break;
    case 4:
      heading = 2
      break;
  
    default:
      break;
  }
	return <>
		<primitive
			position={[position.z, position.y, position.x]}
			rotation={[0, -(heading) * Math.PI / 2, 0]}
			object={geom}
		/>
		<mesh
			onPointerUp={() => switchTurtle(turtle.id)}
			visible={false}
			position={[position.z, position.y, position.x]}
			name={turtle.label}
			scale={[1, 1, 1]}
		>
			<boxBufferGeometry args={[1, 1, 1]} />
		</mesh>
	</>;
}

export const hashCode = function (s) {
	return s.split("").reduce(function (a, b) { a = ((a << 5) - a) + b.charCodeAt(0); return a & a }, 0);
}

class ThreeFiber extends Component {

  constructor(props) {
    super(props)
    this.state = {
      controls: undefined,
      settings: {},
      gui: undefined,
      mousePosition: {x:0, y:0},
      toolTipText: "",
      props: props
    }
  }
  
  findFolder(parent,  text) {
    let childFolders = parent.folders
    for (let i = 0; i < childFolders.length; i++) {
      if (childFolders[i]._title === text) {
        return childFolders[i]
      }
    }
    return null
  }

  setup() {
    let newGui = this.state.gui
    if (typeof(newGui) !== 'undefined') {
      this.state.gui.destroy()
      newGui = new GUI({width: 310, title: 'Map Settings'})
      this.setState({gui: newGui})
    } else {
      newGui = new GUI({width: 310})
      
      this.setState({gui: newGui})
    }
    const panel = newGui


    let folderTurtleControlsText = 'Turtle Controls'
    let folderTurtleControls = this.findFolder(panel, folderTurtleControlsText)
    if (folderTurtleControls === null) {
      folderTurtleControls = panel.addFolder( folderTurtleControlsText );
    }
    let turtleControls = {
      "forward":"W",
      "up":"Space",
      "down":"Control",
      "back":"S",
      "turnLeft":"A",
      "turnRight":"D",
      "digUp":"R",
      "dig":"F",
      "digDown":"B",
    }
    for (let i = 0; i < Object.keys(turtleControls).length; i++) {
      folderTurtleControls.add( turtleControls, Object.keys(turtleControls)[i] );
    }

    let folderBlockVisibilityText = 'Block Visibility'
    let folderBlockVisibility = this.findFolder(panel, folderBlockVisibilityText)
    if (folderBlockVisibility === null) {
      folderBlockVisibility = panel.addFolder( folderBlockVisibilityText );
    }

    let temp = {}
    Object.keys(this.props.world).map((item, index) => {
        let name = this.props.world[item]['blockName']

        let children = folderBlockVisibility.children
        let foundDuplicate = false
        for (let childIndex = 0; childIndex < children.length; childIndex++) {
          let child = children[childIndex]
          if (child['property'] == name) {
            foundDuplicate = true
            break
          }
        }
        if (!foundDuplicate) {
          temp[name] = true
          folderBlockVisibility.add( temp, name );
        }
    })

    folderBlockVisibility.open();
    folderTurtleControls.open();
    this.setState({settings: temp})

    panel.onChange( event => {
      // event.object     // object that was modified
      // event.property   // string, name of property
      // event.value      // new value of controller
      // event.controller // controller that was modified
      
      this.setState({settings: event['object']})
    } );
  }

  componentDidMount() {
    this.setup();
  }

  componentDidUpdate() {
    if (this.props.world !== this.state.props.world) {
      this.setState({props: this.props})
      this.setup();
    }
  }

  updateStateControls(args) {
    this.setState({controls: args})
  }

  updateToolTipText(args) {
    this.setState({toolTipText: args})
  }

  _onMouseMove(e) {
    this.setState({ mousePosition: {x: e.clientX, y: e.clientY} });
  }


  sendMessage(commandText) {
    let socketData = {
      'type': commandText,
      'turtleId': typeof(this.props.connectedTurtle) === 'undefined'?0:this.props.connectedTurtle
    }
    this.props.socket.send(JSON.stringify(socketData))
  }

  _onKeyDown(e) {
    switch (e.key) {
      case "w":
        this.sendMessage('\\forward')
        break;
      case " ":
        this.sendMessage('\\up')
        break;
      case "Control":
        this.sendMessage('\\down')
        break;
      case "s":
        this.sendMessage('\\back')
        break;
      case "a":
        this.sendMessage('\\turnLeft')
        break;
      case "d":
        this.sendMessage('\\turnRight')
        break;
      case "r":
        this.sendMessage('\\digUp')
        break;
      case "f":
        this.sendMessage('\\dig')
        break;
      case "v":
        this.sendMessage('\\digDown')
        break;
    
      default:
        break;
    }
  }

  render() {
    return (
      <div onKeyUp={this._onKeyDown.bind(this)} tabIndex="0">
        <Tooltip title={this.state.toolTipText} 
          PopperProps={{
          anchorEl: {
            clientHeight: 0,
            clientWidth: 0,
            getBoundingClientRect: () => ({
              top: this.state.mousePosition.y - 100,
              left: this.state.mousePosition.x,
              right: this.state.mousePosition.x,
              bottom: this.state.mousePosition.y - 100,
              width: 0,
              height: 0,
            }),
          }
        }}
        onMouseMove={this._onMouseMove.bind(this)}
        >
          <Canvas>
            <CameraController controls={this.state.controls} setControls={this.updateStateControls.bind(this)}/>
            <ambientLight />
            <pointLight position={[10, 10, 10]} />
            
            {Object.keys(this.props.world).map((item, index) => {
              let positions = item.split('_')
              let name = this.props.world[item]['blockName']
              let opacity = undefined
              if (this.state.settings && Object.keys(this.state.settings).length !== 0 && !this.state.settings[name]) {
                opacity = 0
              }

              return <Box 
                key={index} 
                controls={this.state.controls} 
                setControls={this.updateStateControls.bind(this)} 
                position={[positions[2], positions[1], positions[0]]} 
                name={name} 
                setToolTipText={this.updateToolTipText.bind(this)}
                
                color={Color({
                  h: hashCode(name) % 360,
                  s: 60,
                  l: 40,
                }).toString()}
                transparent={true}
                opacity={opacity}/>
            })}
            
            <Compass controls={this.state.controls}/>

            {Object.entries(this.props.turtleStates).map((key, value) => {
              if (this.props.connectedTurtle != key[0]) return
              let turtleState = key[1]
              let position = turtleState['gps']
              let heading = 0
              switch (turtleState['heading']) {
                case 1:
                  heading = 1
                  break;
                case 2:
                  heading = 4
                  break;
                case 3:
                  heading = 3
                  break;
                case 4:
                  heading = 2
                  break;
              
                default:
                  break;
              }
              return <Model key={value} name={value} url="/turtle.glb" position={[position.z, position.y, position.x]} rotation={[0, -(heading) * Math.PI / 2, 0]} />
            })}

            {Object.entries(this.props.turtleStates).map((key, value) => {
              if (this.props.connectedTurtle == key[0]) return
              let turtles = []
              for (let i of Object.entries(this.props.turtleStates)) {
                if (this.props.connectedTurtle == i[0]) continue
                i[1]['id'] = i[0]
                turtles.push(i[1])
              }
              // return <OtherTurtles key={value} turtles={turtles} />
              return <OtherTurtles key={value} turtles={turtles} switchTurtle={this.props.updateConnectedTurtle} />
            })}
          </Canvas>
        </Tooltip>
      </div>
    )
  }
}

export default ThreeFiber