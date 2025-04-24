import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { useNavigate } from 'react-router-dom';

interface CustomMesh extends THREE.Group {
  userData: {
    originalScale: THREE.Vector3;
    targetScale: THREE.Vector3;
    url?: string;
    label?: string;
  };
}

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

export function startCarousel(container: HTMLElement, navigate?: (path: string) =>void) {
  if (!scene) init(container, navigate);
}

function init(container: HTMLElement, navigate?: (path: string) => void) {
  containerElement = container;
  scene = new THREE.Scene();

  const hoverLabel = document.createElement('div');
  Object.assign(hoverLabel.style, {
    position: 'absolute',
    padding: '6px 12px',
    background: 'rgba(0, 0, 0, 0.7)',
    color: 'white',
    borderRadius: '8px',
    pointerEvents: 'none',
    fontSize: '14px',
    zIndex: '10',
    display: 'none',
  });
  container.appendChild(hoverLabel);

  const width = container.clientWidth;
  const height = container.clientHeight;

  camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
  camera.position.set(0, 0.9, 8);
  camera.lookAt(0, 0, 0);

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setClearColor(0x000000, 0);
  renderer.setSize(width, height);
  renderer.domElement.style.pointerEvents = 'auto';
  container.appendChild(renderer.domElement);

  scene.add(new THREE.AmbientLight(0xffffff, 1));
  const directionalLight = new THREE.DirectionalLight(0xffffff, 2);
  directionalLight.position.set(5, 10, 7.5);
  scene.add(directionalLight);

  const modelPaths = [
    'assets/models/water.glb',
    'assets/models/Dumbell.glb',
    'assets/models/Dice.glb',
    'assets/models/Trophy.glb',
    'assets/models/cog.glb',
  ];
  const labels = ['Daily Quests', 'Gym Quests', 'Achievements', 'Leaderboard', 'Settings'];


  // these are all tests to make sure redirection works properly
  const urls = [
    '/DailyQuests',
    '/GymQuests',
    '/Achievements',
    '/Leaderboard',
    '/Settings',
  ];

  const loader = new GLTFLoader();

  modelPaths.forEach((path, i) => {
    loader.load(
      path,
      (gltf) => {
        const root = gltf.scene;
    
        // Normalize scale
        const box = new THREE.Box3().setFromObject(root);
        const size = new THREE.Vector3();
        box.getSize(size);
    
        let scaleFactor = 1.5 / Math.max(size.x, size.y, size.z || 1);
    
        // CUSTOM FIXES:
        if (i === 0) root.position.y += 1.2;          // Water bottle raised slightly
        if (i === 2) scaleFactor *= 0.7; // Dice model (Bonus Quests) too big
        if (i === 4) root.rotation.x = -Math.PI / 2; // Cog model (Settings) laying flat, stand it up
    
        root.scale.setScalar(scaleFactor);
    
        const rootWithMeta = root as CustomMesh;
        rootWithMeta.userData = {
          originalScale: root.scale.clone(),
          targetScale: root.scale.clone(),
          url: urls[i],
          label: labels[i],
        };
    
        scene.add(rootWithMeta);
        models.push(rootWithMeta);
    
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

  const buttonContainer = document.createElement('div');
  Object.assign(buttonContainer.style, {
    position: 'absolute',
    bottom: '30px',
    left: '50%',
    transform: 'translateX(-50%)',
    display: 'flex',
    gap: '16px',
    zIndex: '2',
  });
  container.appendChild(buttonContainer);

  const createButton = (text: string, onClick: () => void) => {
    const btn = document.createElement('button');
    btn.innerText = text;
    Object.assign(btn.style, {
      background: "rgba(255, 106, 255, 0.1)", // frosted purple
      color: "white",
      border: "1.5px rgba(255, 106, 255, 0.7) solid",
      borderRadius: "10px", // rounded square
      width: "50px",
      height: "50px",
      fontSize: "1.5rem",
      fontWeight: "bold",
      fontFamily: "'Poppins', sans-serif",
      display: "flex",           // ensure centering
      alignItems: "center",      // vertical center
      justifyContent: "center",  // horizontal center
      backdropFilter: "blur(6px)",
      cursor: "pointer",
      margin: "0 10px",
      boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
      transition: "0.2s ease",
      userSelect: "none",
    });
    btn.addEventListener('click', onClick);
    btn.addEventListener("mouseenter", () => {
      btn.style.border = "1.5px solid white";
      btn.style.boxShadow = "0 0 12px rgba(255, 255, 255, 0.3)";
    });
    btn.addEventListener("mouseleave", () => {
      btn.style.border = "1.5px solid rgba(255, 106, 255, 0.7)";
      btn.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.3)";
    });
    buttonContainer.appendChild(btn);
  };

  createButton('<', () => rotateModels(1));
  createButton('>', () => rotateModels(-1));

  renderer.domElement.addEventListener('mousemove', (event) => {
    const bounds = renderer.domElement.getBoundingClientRect();
    mouse.x = ((event.clientX - bounds.left) / bounds.width) * 2 - 1;
    mouse.y = -((event.clientY - bounds.top) / bounds.height) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(models, true);

    models.forEach((model) =>
      model.userData.targetScale.copy(model.userData.originalScale)
    );

    if (intersects.length > 0) {
      let hovered = intersects[0].object as THREE.Object3D;
      while (hovered && !('targetScale' in hovered.userData)) {
        hovered = hovered.parent!;
      }

      if (hovered && 'targetScale' in hovered.userData) {
        (hovered as CustomMesh).userData.targetScale.setScalar(
          hovered.userData.originalScale.x * 1.25
        );
        hoverLabel.innerText = hovered.userData.label ?? 'Unknown';
        hoverLabel.style.left = `${event.clientX - bounds.left - 65}px`;
        hoverLabel.style.top = `${event.clientY - bounds.top - 40}px`;
        hoverLabel.style.display = 'block';
      }
    } else {
      hoverLabel.style.display = 'none';
    }
  });

  renderer.domElement.addEventListener('click', () => {
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(models, true);
    if (intersects.length > 0) {
      let clicked = intersects[0].object as THREE.Object3D;
      while (clicked && !('url' in clicked.userData)) {
        clicked = clicked.parent!;
      }
      if (clicked && clicked.userData.url) {
        // if navigate decides to work (ig it doesnt like to sometimes???)
        if (navigate) {
          navigate(clicked.userData.url);
        } else {
          // if not, just href (navigate is faster tho )
          window.location.href = clicked.userData.url;
        }

        
      }
    }
  });

  window.addEventListener('resize', () => {
    const width = containerElement.clientWidth;
    const height = containerElement.clientHeight;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
  });

  animate();
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
  targetAngle += direction * ((Math.PI * 2) / models.length);
}

function animate() {
  requestAnimationFrame(animate);
  angle += (targetAngle - angle) * 0.05;
  updateModelPositions();
  renderer.render(scene, camera);
}

export function resetCarousel() {
  if (renderer && containerElement) {
    containerElement.removeChild(renderer.domElement);
  }
  scene = undefined as any;
  camera = undefined as any;
  renderer = undefined as any;
  models = [];
}