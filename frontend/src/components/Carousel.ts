// Three.js documentation: https://threejs.org/manual/#en/creating-a-scene
import * as THREE from 'three'; // three.js is the 3D rendering technology used for this project
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'; // loads models (.gbl)

//THREE.Group is a collection of 3D objects treated as a single object
// this is essentially what gives the models attributes like size, targetsize, url and labels
interface CustomMesh extends THREE.Group {    
  userData: {
    originalScale: THREE.Vector3;  // original size of the model
    targetScale: THREE.Vector3;    // what to scale up to when hovered over
    url?: string;   // where the model is stored
    label?: string; // the label we assign it when hovered over
  };
}

let scene: THREE.Scene;              // where all 3D elements live
let camera: THREE.PerspectiveCamera; // our 'eyes'
let renderer: THREE.WebGLRenderer;   // draws everything 
let models: CustomMesh[] = [];       // array to hold each model (which are custom meshes)
let angle = 0;                       // the current rotation angle of the carousel
let targetAngle = 0;                 // where the carousel wants to rotate to
const radius = 5;                    // how far from the center models should be
let containerElement: HTMLElement;   // the HTML container where everything is placed
let isDestroyed = false;             // flag to stop animation and removes carousel

const raycaster = new THREE.Raycaster();  // detects hovering and clicking on 3D objects
const mouse = new THREE.Vector2();        // 2D vector representing the mouse's position 

// starts the carousel (shocking, ik)
export function startCarousel(container: HTMLElement, navigate?: (path: string) => void) {
  // if there is currently no scene 
  if (!scene || isDestroyed) {
    isDestroyed = false;        // reset destruction flag to false
    init(container, navigate);  // builds a new scene
  }
}

// this 'init' function is the main setup of our carousel
function init(container: HTMLElement, navigate?: (path: string) => void) {
  containerElement = container;  // stores the DOM container for future use
  scene = new THREE.Scene();     // creates the scene we use

  // creates hoverLabels (text that will appear over each 3D model upon hovering over it)
  const hoverLabel = document.createElement('div');
  Object.assign(hoverLabel.style, {
    position: 'absolute',
    padding: '10px 12px',
    background: 'rgba(0, 0, 0, 0.7)',
    color: 'white',
    borderRadius: '8px',
    pointerEvents: 'none',
    fontSize: '14px',
    yIndex: '10',
    zIndex: '10',
    display: 'none',
  });
  container.appendChild(hoverLabel);

  // camera setup
  const width = container.clientWidth;    // width of camera view
  const height = container.clientHeight;  // height of camera view

  camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);  // using a perspective camera to create a sense of depth (like the 3DS home screen)
  camera.position.set(0, 0.9, 8);   // places the camera away from the center and slighly above for a bit of an overhead feel
  camera.lookAt(0, 0, 0);           // points the camera towards the center 


  // renderer setup
  renderer = new THREE.WebGLRenderer({ antialias: true }); // sets up renderer which draws 3D graphics onto the canvas we are working on
  renderer.setClearColor(0x000000, 0);                     // makes the background transparent (so we can add one)
  renderer.setSize(width, height);                         // matches the renderer's sizes with the camera's sizes        
  renderer.domElement.style.pointerEvents = 'auto';        
  container.appendChild(renderer.domElement);              // Adds the renderer to the HTML page in the container we made

  // lighting 
  scene.add(new THREE.AmbientLight(0xffffff, 1));                     // adds soft light across the entire page
  const directionalLight = new THREE.DirectionalLight(0xffffff, 2);   
  directionalLight.position.set(5, 10, 7.5);                          // adds light to scene as well (as shadows and depth)
  scene.add(directionalLight);                                        // gives the scene the light we set up

  //? ===models (each model has a path, hover label, and url they send the user to)===
  //! model[0] = basic quests
  //! model[1] = gym quests
  //! model[2] = achievements
  //! model[3] = leaderboard
  //! model[4] = settings

  // model paths array
  const modelPaths = [
    'assets/models/water.glb',
    'assets/models/Dumbell.glb',
    'assets/models/Dice.glb',
    'assets/models/Trophy.glb',
    'assets/models/cog.glb',
  ];

  // model hover labels array
  const labels = [
    'Daily Quests', 
    'Gym Quests', 
    'Achievements', 
    'Leaderboard', 
    'Settings'
  ];

  // model url array
  const urls = [
    '/DailyQuests', 
    '/GymQuests', 
    '/Achievements', 
    '/Leaderboard', 
    '/Settings'
  ];

  const loader = new GLTFLoader(); // model loader (.glb)
  models = [];                     // clear previous models if the scene restarts

  // load each model 1 by 1
  modelPaths.forEach((path, i) => {
    // loads 3D model from assets folder
    loader.load(path, (gltf) => {     
        const root = gltf.scene;  // sets root to the object we loaded from the file in assets
        const box = new THREE.Box3().setFromObject(root); // creates an invisible bounding box around the model in order to scale it properly (like when hovering over it)
        const size = new THREE.Vector3();                 // new vector which holds values of length, width, and depth of the model
        box.getSize(size);                                // fills values of size (x, y, z)

        // fixes sizes of models (since some might originally be bigger than others when loading) to be similar in size by the time the user sees them
        let scaleFactor = 1.5 / Math.max(size.x, size.y, size.z || 1);  // calculates how much to increase/decrease the size of the model (sides won't exceed 1.5 units)
        
        // changes size/position of specific models to match others (ik i hardcoded the index, don't hurt me pls)
        if (i === 0) root.position.y += 1.2;          // for 'basic quests' model, move up by 1.2 units
        if (i === 2) scaleFactor *= 0.7;              // for 'achievements' model, make it 70 percent of its current size
        if (i === 4) root.rotation.x = -Math.PI / 2;  // for 'settings' model, it originally was lying flat, so rotate on the x axis to make it stand upright

        root.scale.setScalar(scaleFactor);            // scales entire model by our scale factor we created earlier

        // treat this current model as a CustomMesh (defined earlier with the path, url and labels)
        const rootWithMeta = root as CustomMesh;
        // set all values of this model to the current model's values we defined earlier in beeg array
        rootWithMeta.userData = {
          originalScale: root.scale.clone(),
          targetScale: root.scale.clone(),
          url: urls[i],
          label: labels[i],
        };

        scene.add(rootWithMeta);    // adds the model to the scene (we can SEE now, ooooo)
        models.push(rootWithMeta);  // stores this model in the models array

        // makes sure nothing is positioned (until all models have been loaded), otherwise, things wont be in the right place
        if (models.length === modelPaths.length) {
          updateModelPositions();
        }
      },
      undefined /* onProgress param would have been here, but we dont need it rn */,
      (error) => { // onError is the callback in case the model won't load
        console.error(`Failed to load model at ${path}`, error);
      }
    );
  });

  // creating buttons used to rotate the models
  const buttonContainer = document.createElement('div'); // div to hold the buttons
  Object.assign(buttonContainer.style, {                 // div style
    position: 'absolute',
    bottom: '30px',
    left: '50%',
    transform: 'translateX(-50%)',
    display: 'flex',
    gap: '16px',
    zIndex: '2',
  });
  container.appendChild(buttonContainer);                // adds div to our container

  // function to create styled buttons "<" and ">"
  const createButton = (text: string, onClick: () => void) => {
    
    const btn = document.createElement('button'); // creates HTML button
    btn.innerText = text;                         // sets button label based on value passed in when creating it "<" or ">"
    Object.assign(btn.style, {                    // button style
      background: "rgba(255, 106, 255, 0.1)",
      color: "white",
      border: "1.5px rgba(255, 106, 255, 0.7) solid",
      borderRadius: "10px",
      width: "50px",
      height: "50px",
      fontSize: "1.5rem",
      fontWeight: "bold",
      fontFamily: "'Poppins', sans-serif",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      backdropFilter: "blur(6px)",
      cursor: "pointer",
      margin: "0 10px",
      boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
      transition: "0.2s ease",
      userSelect: "none",
    });

    btn.addEventListener('click', onClick);       // upon being clicked on, call click function
    btn.addEventListener("mouseenter", () => {    // when hovered over, make the button react
      btn.style.border = "1.5px solid white";
      btn.style.boxShadow = "0 0 12px rgba(255, 255, 255, 0.3)";
    });
    btn.addEventListener("mouseleave", () => {    // when mouse leaves, make the button go back to default appearance
      btn.style.border = "1.5px solid rgba(255, 106, 255, 0.7)";
      btn.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.3)";
    });
    buttonContainer.appendChild(btn);             // adds button to container
  };

  // button creation calls
  createButton('<', () => rotateModels(1));   // < button rotates the carousel 1 unit to the right 
  createButton('>', () => rotateModels(-1));  // > button rotates the carousel 1 unit to the left 

  // sets up the mouse movement listener for the scene (so literally every time the mouse moves, this function runs)
  renderer.domElement.addEventListener('mousemove', (event) => {
    const bounds = renderer.domElement.getBoundingClientRect();

    // for the mouse position on the page (between -1 and 1 as required by Three.js for raycasting), find the current position of the mouse
    // consistent across any screen size too!
    
    // According to ChatGPT...
    // Top-left of canvas = (-1, 1)
    // Bottom-right = (1, -1)
    // Center = (0, 0)
    mouse.x = ((event.clientX - bounds.left) / bounds.width) * 2 - 1;  // x position of the mouse
    mouse.y = -((event.clientY - bounds.top) / bounds.height) * 2 + 1; // y position of the mouse

    // detect mouse hover
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(models, true);  // checks which model the ray touches (check all children too being the smaller pieces of the model we imported in)

    // resets all model sizes
    models.forEach((model) =>
      model.userData.targetScale.copy(model.userData.originalScale) // so the model doesn't stay big forever after being hovered over and exited
    );

    // handle the hovered model
    if (intersects.length > 0) {
      let hovered = intersects[0].object as THREE.Object3D;     // this sets hovered to the part of the model we hit. sometimes we hit the child mesh on the model and not the root. count it. 
      while (hovered && !('targetScale' in hovered.userData)) {
        hovered = hovered.parent!;                              // walk up until we find the CustomMesh which is parent to the current child mesh (trophy base => trophy model)
      }

      // grow the model and scale it when it is hovered over
      if (hovered && 'targetScale' in hovered.userData) {
        (hovered as CustomMesh).userData.targetScale.setScalar(
          hovered.userData.originalScale.x * 1.25 // scale the model up 25% when hovered over (to make the dashboard feel interactive)
        );
        // update the text label for this model 
        hoverLabel.innerText = hovered.userData.label ?? 'Unknown';       // sets text inside of textbox for hover label
        hoverLabel.style.left = `${event.clientX - bounds.left - 65}px`;  // sets the x offset (from cursor)
        hoverLabel.style.top = `${event.clientY - bounds.top - 80}px`;    // sets y offset (from cursor) so the box sits above the mouse
        hoverLabel.style.display = 'block';                               // makes the label visible
      }
    } else {
      hoverLabel.style.display = 'none';                                  // if nothing is hovered over, dont display a label or increase the size of the model
    }
  });

  // when the model is clicked on, detect which model was clicked and go to its respective page
  renderer.domElement.addEventListener('click', () => {           // adds click listener
    raycaster.setFromCamera(mouse, camera);                       // casts a ray through the mouse's current position from the camera
    const intersects = raycaster.intersectObjects(models, true);  // sets hovered to the part of the model we hit.
    if (intersects.length > 0) {
      let clicked = intersects[0].object as THREE.Object3D;       // the closes object hit is the one we want to use for this function
      while (clicked && !('url' in clicked.userData)) {           // if the model we hit didnt have a CustomMesh associated with it, but was still part of a model, 
        clicked = clicked.parent!;                                // walk up until we find the CustomMesh which is parent to the current child mesh (trophy base => trophy model)
      }
      if (clicked && clicked.userData.url) {            // if this model is the CustomMesh...
        if (navigate) {                                 // if we are using navigate to go from one page to another
          navigate(clicked.userData.url);               // navigate to the page associated with this model
        } else {                                        // if we have any issues using navigate for any reason...
          window.location.href = clicked.userData.url;  // use window.location.href (reloads the page instead of smooth transition)
        }
      }
    }
  });

  // ensures that the carousel and models stay consistent, even when the browser window is resized
  window.addEventListener('resize', () => {
    const width = containerElement.clientWidth;   // width adjustment according to the current window size
    const height = containerElement.clientHeight; // height adjustment according to the current window size
    camera.aspect = width / height;               // change the way the camera percieves the carousel based on our new values
    camera.updateProjectionMatrix();              // so that new settings take place onscreen
    renderer.setSize(width, height);              // resizes the canvas
  });
  animate();  // 
}

// updates the positions of the models in the circular path we put them on
function updateModelPositions() {
  models.forEach((model, index) => {                                  // for every model
    const theta = angle + (index * (Math.PI * 2)) / models.length;    // calculates where on the circular path this model should go (if we add any more models, this will position every model correctly)
    model.position.x = Math.sin(theta) * radius;                      // places the model in the correct X position on this carousel
    model.position.z = Math.cos(theta) * radius;                      // places the model in the correct Z position on this carousel   
    model.position.y = 0;                                             // we place the model on 0 for Y since its a carousel, not a circular sine wave (that sounds kinda cool though)

    // lerp = linear interpolation
    model.scale.lerp(model.userData.targetScale, 0.1);                // changes the model by 10% on each frame (when hovering or exiting)
    model.rotation.y = 0;                                             // we dont need to rotate on the Y axis
  });
}

// updates targetAngle, which we need so the carousel knows where to go
function rotateModels(direction: number) {
  targetAngle += direction * ((Math.PI * 2) / models.length); // moves 1 or -1 by one model's worth of rotation
}

// animation loop. runs continuously to animate the scene
function animate() {
  if (isDestroyed) return;                      // stop loop after reset
  requestAnimationFrame(animate);               // updates the next frame (60 times a second)
  if (!renderer || !scene || !camera) return;   // sanity check. if any of our scene elements hasn't loaded properly, don't error out, just return

  angle += (targetAngle - angle) * 0.05;        // instead of snapping models to their correct spot, make them smoothly transition over to their correct locations
  updateModelPositions();                       // spins and animates scale of models
  renderer.render(scene, camera);               // draws the new 3D scene to the screen (instead of making all these changes and noting appearing to reflect it)
}

// stops animation loop, removes the canvas from the HTML, and resets global variables (for switching pages)
export function resetCarousel() {
  isDestroyed = true;                                     // stop the animation loop
  if (renderer && containerElement) {
    containerElement.removeChild(renderer.domElement);    // removes the webGL canvas we made everything on from the current page
  }

  // resets variables to undefined (so nothing doubles or misbehaves upon reloading the carousel)
  scene = undefined as any;
  camera = undefined as any;
  renderer = undefined as any;
  models = [];
}
