import { hover } from 'framer-motion';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

interface CustomMesh extends THREE.Mesh {
  position: THREE.Vector3;
  scale: THREE.Vector3;
  rotation: THREE.Euler;
  userData: {
    originalScale: THREE.Vector3;
    targetScale: THREE.Vector3;
    url?: string;
    label?: string;
  };
}

// Global variables
let scene: THREE.Scene;
let camera: THREE.PerspectiveCamera;
let renderer: THREE.WebGLRenderer;
let models: CustomMesh[] = [];
let angle = 0;
let targetAngle = 0;
const radius = 5;
let containerElement: HTMLElement;
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

export function startCarousel(container: HTMLElement) {
  if (!scene) {
    init(container);
  }
}

function init(container: HTMLElement) {
  containerElement = container;
  scene = new THREE.Scene();

  // new stuff to add text when hovering over a model
    const hoverLabel = document.createElement('div');
    hoverLabel.style.position = 'absolute';
    hoverLabel.style.padding = '6px 12px';
    hoverLabel.style.background = 'rgba(0, 0, 0, 0.7)';
    hoverLabel.style.color = 'white';
    hoverLabel.style.borderRadius = '8px';
    hoverLabel.style.pointerEvents = 'none';
    hoverLabel.style.fontSize = '14px';
    hoverLabel.style.zIndex = '10';
    hoverLabel.style.display = 'none';
    container.appendChild(hoverLabel);

  const width = container.clientWidth;
  const height = container.clientHeight;

  // Set up camera
  camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
  camera.position.z = 8;
  camera.position.y = 1.2;
  camera.lookAt(new THREE.Vector3(0, 0, 0)); // centered look

  // Set up renderer
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setClearColor(0x000000, 0);
  renderer.setSize(width, height);
  renderer.domElement.style.pointerEvents = 'auto';
  container.appendChild(renderer.domElement);

  // Lights
  const ambientLight = new THREE.AmbientLight(0xffffff, 1);
  scene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 2);
  directionalLight.position.set(5, 10, 7.5);
  scene.add(directionalLight);

  // Boxes
  const modelPaths = [
    '/models/water.glb',    // basic quests
    '/models/Dumbell.glb',  // gym quests
    '/models/Dice.glb',     // bonus quests
    '/models/Trophy.glb',   // leaderboard
    '/models/Gears.glb'     // settings
  ];
  
  const labels = [
    "Daily Quests",
    "Gym Quests",
    "Bonus Quests",
    "Leaderboard",
    "Settings"
  ];
  
  const urls = [
    'https://example.com/page1',
    'https://example.com/page2',
    'https://example.com/page3',
    'https://example.com/page4',
    'https://example.com/page5'
  ];
  
  const loader = new GLTFLoader();

  modelPaths.forEach((path, i) => {
    loader.load(
      path,
      (gltf) => {
        const model = gltf.scene as unknown as CustomMesh;
        model.scale.set(1, 1, 1);
        model.userData = {
          originalScale: new THREE.Vector3(1, 1, 1),
          targetScale: new THREE.Vector3(1, 1, 1),
          url: urls[i],
          label: labels[i]
        };
        scene.add(model);
        models.push(model);
  
        // Only update positions after all models are loaded
        if (models.length === modelPaths.length) {
          updateModelPositions();
        }
      },
      undefined,
      (error) => {
        console.error(`Failed to load model at ${path}`, error);
      }
    );
  });

  updateModelPositions();

  // Centered button container
  const buttonContainer = document.createElement('div');
  buttonContainer.style.position = 'absolute';
  buttonContainer.style.bottom = '30px';
  buttonContainer.style.left = '50%';
  buttonContainer.style.transform = 'translateX(-50%)';
  buttonContainer.style.display = 'flex';
  buttonContainer.style.gap = '16px';
  buttonContainer.style.zIndex = '2';
  container.appendChild(buttonContainer);

  // Button creation and styling
  const leftButton = document.createElement('button');
  leftButton.innerText = '-';
  styleButton(leftButton);
  leftButton.addEventListener('click', () => rotateModels(1));

  const rightButton = document.createElement('button');
  rightButton.innerText = '+';
  styleButton(rightButton);
  rightButton.addEventListener('click', () => rotateModels(-1));

  buttonContainer.appendChild(leftButton);
  buttonContainer.appendChild(rightButton);

  // Hover effect
  renderer.domElement.addEventListener('mousemove', (event) => {
    const bounds = renderer.domElement.getBoundingClientRect();
    mouse.x = ((event.clientX - bounds.left) / bounds.width) * 2 - 1;
    mouse.y = -((event.clientY - bounds.top) / bounds.height) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(models, false);

    models.forEach((model) => {
      model.userData.targetScale.set(1, 1, 1);
    });

    if (intersects.length > 0) {
      const hovered = intersects[0].object as CustomMesh;
      hovered.userData.targetScale.set(1.2, 1.2, 1.2);

        // show the label
        hoverLabel.style.display = 'block';
        hoverLabel.innerText = hovered.userData.label ?? 'Unknown';

        // to put the label near the mouse
        const labelOffsetX = -65;
        const labelOffsetY = -40;
        hoverLabel.style.left = `${event.clientX - bounds.left + labelOffsetX}px`;
        hoverLabel.style.top = `${event.clientY - bounds.top + labelOffsetY}px`;

    } else {
        hoverLabel.style.display = 'none';
    }
  });

  // Click-to-open
  renderer.domElement.addEventListener('click', () => {
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(models, false);

    if (intersects.length > 0) {
      const clicked = intersects[0].object as CustomMesh;
      if (clicked.userData.url) {
        window.open(clicked.userData.url, '_blank');
      }
    }
  });

  // Resize handler
  window.addEventListener('resize', () => {
    const width = containerElement.clientWidth;
    const height = containerElement.clientHeight;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
  });

  animate();
}

function styleButton(button: HTMLButtonElement) {
  button.style.background = '#222';
  button.style.color = 'white';
  button.style.border = 'none';
  button.style.borderRadius = '8px';
  button.style.padding = '12px 16px';
  button.style.fontSize = '1.5rem';
  button.style.cursor = 'pointer';
}

function updateModelPositions() {
  models.forEach((model, index) => {
    const theta = angle + (index * (Math.PI * 2)) / models.length;
    model.position.x = Math.sin(theta) * radius;
    model.position.z = Math.cos(theta) * radius;
    model.position.y = 0;
    model.scale.lerp(model.userData.targetScale, 0.1);
    model.rotation.y = 0;
  });
}

function rotateModels(direction: number) {
  targetAngle += direction * (Math.PI * 2) / models.length;
  if (direction === -1) {
    models.push(models.shift()!);
  } else {
    models.unshift(models.pop()!);
  }
}

function animate() {
  requestAnimationFrame(animate);
  angle += (targetAngle - angle) * 0.05;
  updateModelPositions();
  renderer.render(scene, camera);
}
