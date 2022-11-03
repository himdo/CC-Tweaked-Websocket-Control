import React, { Component, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame, useLoader, useThree } from '@react-three/fiber'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import Color from 'color';
import { AxesHelper, Euler, MeshLambertMaterial, Quaternion, Vector3 } from 'three';
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';
import { Text } from '@react-three/drei';
import "./ReactThreeCanvas.css"

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

function Box(props) {
  const mesh = useRef(null)
  const [hovered, setHover] = useState(false)
  const [active, setActive] = useState(false)
  // useFrame((state, delta) => (mesh.current.rotation.x += 0.01))
  return (
    <mesh
      {...props}
      ref={mesh}
      // scale={active ? 1.5 : 1}
      onClick={(event) => {onClickBox({name: props.name, position: props.position, controls: props.controls, setControls: props.setControls}), setActive(!active)}}
      onPointerOver={(event) => setHover(true)}
      onPointerOut={(event) => setHover(false)}>
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
      props: props
    }
  }

  setup() {
    let newGui = this.state.gui
    if (typeof(newGui) !== 'undefined') {
      this.state.gui.destroy()
      newGui = new GUI({width: 310})
      this.setState({gui: newGui})
    } else {
      newGui = new GUI({width: 310})
      
      this.setState({gui: newGui})
    }
    const panel = newGui

    let folder1
    if (panel.children.length === 0) {
      folder1 = panel.addFolder( 'Visibility' );
    } else {
      folder1 = panel.children[0]
    }
    let temp = {}
    Object.keys(this.props.world).map((item, index) => {
        let name = this.props.world[item]['blockName']

        let children = folder1.children
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
          folder1.add( temp, name );
        }
    })

    folder1.open();
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

  render() {

    return (
      <div>
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

            return <Box key={index} controls={this.state.controls} setControls={this.updateStateControls.bind(this)} position={[positions[2], positions[1], positions[0]]} name={name} color={Color({
              h: hashCode(name) % 360,
              s: 60,
              l: 40,
            }).toString()}
            transparent={true}
            opacity={opacity}/>
          })}
          
          <Compass controls={this.state.controls}/>
          {Object.keys(this.props.turtleStates).map((item, index) => {
            let turtleState = this.props.turtleStates[item]
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

            return(
              <Model key={index} name={'TODO'} url="/turtle.glb" position={[position.z, position.y, position.x]} rotation={[0, -(heading) * Math.PI / 2, 0]} />
            )
          })}
        </Canvas>
      </div>
    )
  }
}

export default ThreeFiber