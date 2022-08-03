import * as THREE from "three";
import { OrbitControls } from "https://cdn.skypack.dev/three@0.132.2/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "https://cdn.skypack.dev/three@0.132.2/examples/jsm/loaders/GLTFLoader.js";
import {
  CSS2DRenderer,
  CSS2DObject,
} from "https://cdn.skypack.dev/three@0.132.2/examples/jsm/renderers/CSS2DRenderer.js";
let renderer, scene, camera, cube, controls;
const loader = new GLTFLoader();
const allGroupNames = [];
let labelRenderer, line;

const groupMap = {
  Core_assemSTEP: {
    // red cog
    color: new THREE.MeshStandardMaterial({
      color: 0xc44949,
      roughness: 0.5,
      metalness: 0.5,
    }),
    hover: new THREE.MeshStandardMaterial({
      color: 0xff0000,
      roughness: 0.5,
      metalness: 0.5,
    }),
  },
  Körper1_8: {
    color: new THREE.MeshStandardMaterial({
      color: 0x4953c4,
      roughness: 0.5,
      metalness: 0.5,
    }),
    hover: new THREE.MeshStandardMaterial({
      color: 0x1111ff,
      roughness: 0.5,
      metalness: 0.5,
    }),
  },
  Körper1_3: {
    // blue ring
    color: new THREE.MeshStandardMaterial({
      color: 0x4953c4,
      roughness: 0.5,
      metalness: 0.5,
    }),
    hover: new THREE.MeshStandardMaterial({
      color: 0x1111ff,
      roughness: 0.5,
      metalness: 0.5,
    }),
  },
};
init();
animate();

function addLine(object) {
  let points = [];
  let geometry = new THREE.BufferGeometry();
  let material = new THREE.LineDashedMaterial({
    color: 0xff0000,
    dashSize: 1,
    gapSize: 0.5,
  });
  let termination = new THREE.Vector3(15, 10, 5);
  let text = document.createElement("div");
  text.textContent = "Core_assemSTEP";
  let sphere = new THREE.SphereGeometry(0.1, 32, 32);
  let sphereMesh = new THREE.Mesh(sphere, material);
  sphereMesh.position.set(termination.x, termination.y, termination.z);
  sphereMesh.layers.enableAll();
  scene.add(sphereMesh);
  let sphereLabel = new CSS2DObject(text);
  sphereLabel.position.set(1, 1, 1);
  sphereLabel.element.style.color = "whitesmoke";
  sphereLabel.element.style.fontSize = "1.5em";
  sphereLabel.element.style.fontFamily = "sans-serif";
  sphereLabel.element.style.fontWeight = "bold";
  sphereLabel.layers.set(0);
  sphereMesh.add(sphereLabel);

  points.push(termination, object.position);
  geometry.setFromPoints(points);
  line = new THREE.LineSegments(geometry, material);
  line.computeLineDistances();
  scene.add(line);
}

function iterateChildren(child, cb) {
  if (!child.children || !child.children.length) {
    return;
  }
  for (const c of child.children) {
    cb(c);
    iterateChildren(c, cb);
  }
}

function init() {
  labelRenderer = new CSS2DRenderer();
  labelRenderer.setSize(window.innerWidth, window.innerHeight);
  labelRenderer.domElement.style.position = "absolute";
  labelRenderer.domElement.style.top = 0;
  labelRenderer.domElement.style.pointerEvents = "none";
  document.body.appendChild(labelRenderer.domElement);
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x444444);
  camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    1,
    1000
  );
  camera.position.set(25, 44, 23);
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
  scene.add(ambientLight);

  const dirLight = new THREE.DirectionalLight(0xefefff, 1);
  dirLight.position.set(10, 10, 10);
  scene.add(dirLight);

  loader.setPath("/assets/model2/").load("model.gltf", function (gltf) {
    for (const name in groupMap) {
      allGroupNames.push(name);
    }
    gltf.scene.traverse((child) => {
      if (child.name === "closerSTEP") {
        child.visible = false;
        return;
      }
      if (child.name === "Core_assemSTEP") {
        addLine(child.children[1]);
      }
      if (allGroupNames.indexOf(child.name) === -1) {
        return;
      }
      const name = child.name;
      const groupObjects = [];
      iterateChildren(child, (c) => {
        if (c.isMesh) {
          groupObjects.push(c);
          c.material = groupMap[name].color;
        }
      });
    });
    gltf.scene.scale.set(45, 45, 45);
    scene.add(gltf.scene);
  });

  renderer = new THREE.WebGLRenderer({
    canvas: document.getElementById("canvas"),
    antialias: true,
  });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.outputEncoding = THREE.sRGBEncoding;

  controls = new OrbitControls(camera, renderer.domElement);
  // controls.addEventListener("change", render);
  controls.screenSpacePanning = true;
  // controls.maxPolarAngle = Math.PI / 2;
  // controls.minDistance = 50;
  controls.maxDistance = 100;
  // controls.autoRotate = true;
  // controls.autoRotationSpeed = 5;
  controls.enableDamping = true;
  controls.dampingFactor = 0.25;

  window.addEventListener("resize", onWindowResize);
  window.addEventListener("mousemove", onMouseMove);
}
function updateLine() {
  // line.geometry.setFromPoints([
  //   new THREE.Vector3(0, 0, 0),
  //   new THREE.Vector3(20, 10, 5),
  // ]);
  line.geometry.verticesNeedUpdate = true;
}

function onMouseMove() {
  updateLine();
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  render();
}

function render() {
  renderer.render(scene, camera);
}

function animate() {
  controls.update();
  requestAnimationFrame(animate);
  labelRenderer.render(scene, camera);
  render();
}
