import * as THREE from 'three';
import { vertex as basicVertex, fragment as basicFragment } from '../shaders/basic';
let materials = {
    "minecraft:air": new THREE.ShaderMaterial({
        transparent: true,
        side: THREE.DoubleSide,
        vertexShader: basicVertex,
        fragmentShader: basicFragment,
        uniforms: {
          uColor: {value: new THREE.Color('yellow')},
          uOpacity: {value: 0.2}
        },
        glslVersion: THREE.GLSL3
    }),
    "minecraft:stone": new THREE.ShaderMaterial({
        transparent: true,
        side: THREE.DoubleSide,
        vertexShader: basicVertex,
        fragmentShader: basicFragment,
        uniforms: {
          uColor: {value: new THREE.Color('green')},
          uOpacity: {value: 1.0}
        },
        glslVersion: THREE.GLSL3
    }),
}
export default materials