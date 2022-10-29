import * as THREE from 'three';
import { Mesh, Vector3, MathUtils } from 'three';
import gsap from 'gsap';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { vertex as basicVertex, fragment as basicFragment } from './shaders/basic';


class ThreeCanvas {
    constructor(options) {
      console.log(options)
      const { mountPoint, width, height } = options;
  
      // this is just here for reference. most of this file should be overwritten :)
  
      // basics
      const clock = this.clock = new THREE.Clock();
      const scene = new THREE.Scene();
      const camera = this.camera = new THREE.PerspectiveCamera( 45, width / height, 1, 1000 );
      
      const renderer = this.renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true,
      });
  
      scene.background = new THREE.Color( 0xff0000 );
    //   scene.background = new THREE.Color( theme.colors.white );
      renderer.setSize( width, height );
      // camera.position.z = 0;
      const controls = this.controls = new OrbitControls(camera, renderer.domElement);
      // camera.position.set(0,0,0.1)
      camera.position.set( 0, 20, 100 );
      // controls.target.set(5, 0, 0);
      controls.update();
      // post processing support
      const composer = this.composer = new EffectComposer( renderer );
  
      const renderPass = new RenderPass( scene, camera );
      renderPass.clear = false;
      composer.addPass( renderPass );
  
      // mount to DOM
      mountPoint.appendChild( renderer.domElement );
  
      this.addMeshes(scene);
    }
  
    addMeshes(scene) {
      const cubeGroup = this.cubeGroup = new THREE.Group();
      const cubeInitialPositions = [
        {
          rotation: new Vector3(35, 35, 0),
          position: new Vector3(0, -0.5, 0),
        },
        {
          rotation: new Vector3(-35, -95, 0),
          position: new Vector3(0, 1, 0),
        },
      ];
  
      // some standard material or ShaderMaterial
      // const material = new THREE.MeshBasicMaterial( { color: theme.baseFontColor } );
      const material = new THREE.ShaderMaterial({
        // transparent: true,
        side: THREE.DoubleSide,
        vertexShader: basicVertex,
        fragmentShader: basicFragment,
        uniforms: {
          time: { value: 0 },
        },
      });
  
      for (let i=0; i < 2; i++) {
        const geometry= new THREE.BoxGeometry();
  
        const cube = new Mesh( geometry, material );
        cubeGroup.add(cube);
  
        cube.rotation.set(cubeInitialPositions[i].rotation.x, cubeInitialPositions[i].rotation.y, cubeInitialPositions[i].rotation.z,);
        cube.position.set(cubeInitialPositions[i].position.x, cubeInitialPositions[i].position.y, cubeInitialPositions[i].position.z,);
      }
  
      // cubeGroup.position.z = -7; // push 7 meters back
      gsap.to(cubeGroup.rotation, {duration: 10, y: Math.PI * 2, repeat: -1, ease: "none"});
      scene.add(cubeGroup);
    }
  
    resizeRendererToDisplaySize(renderer) {
      const canvas = renderer.domElement;
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
  
      const needResize = canvas.width !== width || canvas.height !== height;
  
      if (needResize) {
        renderer.setSize(width, height, false);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // use 2x pixel ratio at max
      }
  
      return needResize;
    }
  
    setAnimationLoop(callback) {
      this.renderer.setAnimationLoop(callback);
    }
  
    render() {
      // check if we need to resize the canvas and re-setup the camera
      if (this.resizeRendererToDisplaySize(this.renderer)) {
        const canvas = this.renderer.domElement;
        this.camera.aspect = canvas.clientWidth / canvas.clientHeight;
        this.camera.updateProjectionMatrix();
      }
      this.controls.update();
      this.composer.render();
    }
  }
  
  export default ThreeCanvas;