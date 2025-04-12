import * as THREE from 'three';

interface CustomMesh extends THREE.Mesh {
  position: THREE.Vector3;
  scale: THREE.Vector3;
  rotation: THREE.Euler;
  userData: {
    originalScale: THREE.Vector3;
    targetScale: THREE.Vector3;
    url?: string;
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
  const geometry = new THREE.BoxGeometry();
  const material = new THREE.MeshStandardMaterial({ color: 0xffffff });
  const urls = [
    'https://example.com/page1',
    'https://example.com/page2',
    'https://example.com/page3',
    'https://example.com/page4',
    'https://example.com/page5'
  ];

  for (let i = 0; i < 5; i++) {
    const model = new THREE.Mesh(geometry, material) as unknown as CustomMesh;
    model.scale.set(1, 1, 1);
    model.userData = {
      originalScale: new THREE.Vector3(1, 1, 1),
      targetScale: new THREE.Vector3(1, 1, 1),
      url: urls[i],
    };
    scene.add(model);
    models.push(model);
  }

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
