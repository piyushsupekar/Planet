import './style.css';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import gsap from 'gsap';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader';

// Scene setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  25,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
const renderer = new THREE.WebGLRenderer({
  canvas: document.querySelector('#canvas'),
  antialias: true,
});
// HDRI loader
const rgbeLoader = new RGBELoader();
rgbeLoader.load(
  'https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/2k/moonlit_golf_2k.hdr',
  function (texture) {
    texture.mapping = THREE.EquirectangularReflectionMapping;
    scene.environment = texture;
    scene.background = texture;
  }
);

// Create a large sphere for the starfield background
const starfieldGeometry = new THREE.SphereGeometry(50, 64, 64);
const starfieldTexture = new THREE.TextureLoader().load('./stars.jpg');
starfieldTexture.colorSpace = THREE.SRGBColorSpace;
starfieldTexture.wrapS = THREE.RepeatWrapping;
starfieldTexture.wrapT = THREE.RepeatWrapping;
const starfieldMaterial = new THREE.MeshBasicMaterial({
  map: starfieldTexture,
  side: THREE.BackSide, // Render on the inside of the sphere
  transparent: true,
  opacity: 0.8,
});
const starfield = new THREE.Mesh(starfieldGeometry, starfieldMaterial);
scene.add(starfield);

// Configure renderer
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

const spheresMesh = [];
const radius = 1.3;
const segments = 64;
const orbitRadius = 4.4;
const colors = [0x00ff00, 0x0000ff, 0xff00ff, 0xffff00];
const textures = [
  './earth/map.jpg',
  './csilla/color.png',
  './venus/map.jpg',
  './volcanic/color.png',
];
const textures2 = [
  './earth/cloud.jpg',
  './csilla/cloud.png',
  './earth/cloud.jpg',
  './earth/cloud.png',
];
const spheres = new THREE.Group();

for (let i = 0; i < 4; i++) {
  const textureLoader = new THREE.TextureLoader();
  const texture = textureLoader.load(textures[i]);
  texture.colorSpace = THREE.SRGBColorSpace;
  const texture2 = textureLoader.load(textures2[i]);
  texture2.colorSpace = THREE.SRGBColorSpace;
  const geometry = new THREE.SphereGeometry(radius, segments, segments);
  const material = new THREE.MeshStandardMaterial({
    // color: colors[i],
    // wireframe: true,
    map: texture,
    alphaMap: texture2,
    // metalness: 1,
    side: THREE.DoubleSide,
    // roughness: 0.001,
  });
  const sphere = new THREE.Mesh(geometry, material);
  spheresMesh.push(sphere);

  material.map = texture;
  // const texture2 = textureLoader.load('./earth/cloud.jpg');
  // material.map = texture2;
  // const texture3 = textureLoader.load('./earth/map.jpg');
  // material.map = texture3;

  const angle = (i / 4) * (Math.PI * 2);
  sphere.position.x = orbitRadius * Math.cos(angle);
  sphere.position.z = orbitRadius * Math.sin(angle);
  spheres.add(sphere);
}
spheres.rotation.x = 0.03;
spheres.position.y = -1.2;
scene.add(spheres);

// Add orbit controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.01;

// Camera position
camera.position.z = 8;

let throttleTimeout;
let isThrottled = false;
let scrollCount = 0;

window.addEventListener('wheel', (event) => {
  if (isThrottled) return;
  isThrottled = true;
  scrollCount = (scrollCount + 1) % 4;
  // console.log(scrollCount);
  if (event.deltaY < 0) {
    scrollCount++;
    console.log('Wheel scrolled up');
  } else {
    console.log('Wheel scrolled down');
  }

  const headings = document.querySelectorAll('.planet-names');
  gsap.to(headings, {
    duration: 0.7,
    y: `-=${100}%`,
    ease: 'power2 .inOut',
  });
  gsap.to(spheres.rotation, {
    duration: 1,
    y: `-=${Math.PI / 2}`,
    ease: 'power2 .inOut',
  });
  if (scrollCount === 0) {
    gsap.to(headings, {
      duration: 1,
      y: `0`,
      ease: 'power1 .inOut',
    });
  }
  throttleTimeout = setTimeout(() => {
    isThrottled = false;
  }, 2000);
});

// setInterval(() => {
//   gsap.to(spheres.rotation, {
//     y: `+=${Math.PI / 2}`,
//     duration: 2,
//     ease: 'expo.easeInOut',
//   });
// }, 2500);
// Animation loop
function animate() {
  requestAnimationFrame(animate);
  controls.update();
  for (let i = 0; i < spheresMesh.length; i++) {
    spheresMesh[i].rotation.y -= 0.0001;
  }
  renderer.render(scene, camera);
}

animate();
