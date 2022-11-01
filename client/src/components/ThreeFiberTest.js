import React, { useEffect, useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

const CameraController = () => {
  const { camera, gl } = useThree();
  useEffect(
    () => {
      const controls = new OrbitControls(camera, gl.domElement);
      controls.minDistance = 3;
      controls.maxDistance = 20;
      return () => {
        controls.dispose();
      };
    },
    [camera, gl]
  );
  return null;
};

function Box(props) {
  const mesh = useRef(null)
  const [hovered, setHover] = useState(false)
  const [active, setActive] = useState(false)
  // useFrame((state, delta) => (mesh.current.rotation.x += 0.01))
  return (
    <mesh
      {...props}
      ref={mesh}
      scale={active ? 1.5 : 1}
      onClick={(event) => setActive(!active)}
      onPointerOver={(event) => setHover(true)}
      onPointerOut={(event) => setHover(false)}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color={hovered ? 'hotpink' : 'orange'} />
    </mesh>
  )
}

export default function ThreeFiberTest(props) {
  let world = props['world']
  console.log(world)
  
  return (
    <Canvas>
      <CameraController/>
      <ambientLight />
      <pointLight position={[10, 10, 10]} />
      {Object.keys(world).map((item, index) => (
        <Box key={index} position={[item.split('_')[2], item.split('_')[1], item.split('_')[0]]} />
      ))}
      {/* <Box position={[-1, 0, 0]} /> */}
      {/* <Box position={[0, 0, 0]} /> */}
    </Canvas>
  )
}