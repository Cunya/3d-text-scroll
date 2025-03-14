// Import Three.js at the top of the file
import * as THREE from 'three';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

// Set up scene, camera, renderer
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000000); // Set scene background to pure black

const camera = new THREE.PerspectiveCamera(30, window.innerWidth / window.innerHeight, 0.1, 1000);

// Calculate new camera position
// Previous position was 30 * 1.15 * 0.9 = 31.05
// Now we want another 10% closer: 31.05 * 0.9 = 27.945
const cameraDistance = 30 * 1.15 * 0.9 * 0.9; // 15% further, then 10% closer, then another 10% closer
const cameraHeight = 5 + (cameraDistance * Math.sin(20 * Math.PI / 180)); // Calculate y position based on angle

camera.position.set(0, cameraHeight, cameraDistance);
camera.lookAt(0, 0, 0);

const renderer = new THREE.WebGLRenderer({ 
    antialias: true,
    alpha: false,
    precision: 'highp',
    logarithmicDepthBuffer: true
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.5;
renderer.setPixelRatio(1.0);
renderer.setClearColor(0x000000);
document.body.appendChild(renderer.domElement);

window.addEventListener('resize', onWindowResize, false);

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

// Update the spotlight creation function for better lighting
function createSpotLight(color, intensity, position, angle, penumbra) {
    const light = new THREE.SpotLight(color, intensity);
    light.position.set(position[0], position[1], position[2]);
    light.angle = angle;
    light.penumbra = penumbra;
    light.distance = 50;  // Reduced distance for more focused effect
    light.decay = 2;      // Increased decay for faster falloff
    light.intensity = intensity;
    
    // Target slightly below text for better illumination
    const targetObject = new THREE.Object3D();
    targetObject.position.set(position[0], -1, 0);
    scene.add(targetObject);
    light.target = targetObject;
    
    return light;
}

// Create new lights with better focus and blue lights closer to white
const centerLight = createSpotLight(0xffffff, 275, [0, 12, 15], Math.PI / 10, 0.6);  // Increased from 250 to 350
const leftLight = createSpotLight(0x0066ff, 180, [-8, 12, 15], Math.PI / 10, 0.6);   // Kept the same
const rightLight = createSpotLight(0x0066ff, 180, [8, 12, 15], Math.PI / 10, 0.6);   // Kept the same

// Yellow backlight
const yellowBackLight = createSpotLight(0xffcc00, 60, [0, 10, -15], Math.PI / 8, 0.7);
yellowBackLight.target.position.set(0, 0, 0);  // Point at the center of the scene

// Add a hair light from above to highlight the top edges of the text
const hairLight = createSpotLight(0xffffff, 100, [0, 20, 0], Math.PI / 12, 0.5);
// Create a custom target for the hair light to point downward
const hairLightTarget = new THREE.Object3D();
hairLightTarget.position.set(0, 0, 0);
scene.add(hairLightTarget);
hairLight.target = hairLightTarget;

scene.add(centerLight);
scene.add(leftLight);
scene.add(rightLight);
scene.add(yellowBackLight);
scene.add(hairLight);  // Add the hair light to the scene

// Add extremely minimal ambient light just for visibility of form
const ambientLight = new THREE.AmbientLight(0xffffff, 0.01);  // Reduced to 0.01 (almost none)
scene.add(ambientLight);

const scrollText = `Artificial intelligence (AI), in its broadest sense, is intelligence exhibited by machines, particularly computer systems. It is a field of research in computer science that develops and studies methods and software that enable machines to perceive their environment and use learning and intelligence to take actions that maximize their chances of achieving defined goals. Such machines may be called AIs.`;

const wordsArray = scrollText.split(' ');

// Create text meshes
const loader = new FontLoader();
loader.load(
    '/helvetiker_regular.typeface.json',
    function(font) {
        let xPosition = 20;
        const startingPositions = [];

        // Update text material for better contrast
        const textMaterial = new THREE.MeshPhongMaterial({ 
            color: 0xffffff,
            specular: 0xaaaaaa,
            shininess: 70,       // Increased shininess for more defined highlights
            emissive: 0x000000,  // No emission
            flatShading: false
        });

        wordsArray.forEach((word, index) => {
            const textGeometry = new TextGeometry(word, {
                font: font,
                size: 1.5,
                height: 0.3,
                curveSegments: 8,
                bevelEnabled: true,
                bevelThickness: 0.01,
                bevelSize: 0.01,
                bevelOffset: 0,
                bevelSegments: 2
            });

            textGeometry.computeBoundingBox();
            textGeometry.computeVertexNormals();

            const textMesh = new THREE.Mesh(textGeometry, textMaterial);
            textMesh.position.set(xPosition, 0, 0);
            scene.add(textMesh);

            const textWidth = textGeometry.boundingBox.max.x - textGeometry.boundingBox.min.x;
            startingPositions.push(xPosition);
            
            // Reduce the gap between words to 2/3 of its current size
            // Current gap is 1.5, so 2/3 of that is 1.0
            xPosition += textWidth + 1.0;  // Changed from 1.5 to 1.0
        });

        // Animation loop
        const speed = 0.1 * (2/3);  // Reduced to 2/3 of original speed (0.0667)
        let allWordsExited = true;
        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.05;
        controls.screenSpacePanning = false;
        controls.minDistance = 10;
        controls.maxDistance = 100;
        controls.maxPolarAngle = Math.PI / 2;

        function animate() {
            requestAnimationFrame(animate);
            controls.update();

            allWordsExited = true;
            let meshIndex = 0;
            scene.children.forEach((child) => {
                if (child instanceof THREE.Mesh && child.geometry instanceof TextGeometry) {
                    child.position.x -= speed;

                    if (child.position.x > -50) {
                        allWordsExited = false;
                    }

                    meshIndex++;
                }
            });

            if (allWordsExited) {
                meshIndex = 0;
                scene.children.forEach((child) => {
                    if (child instanceof THREE.Mesh && child.geometry instanceof TextGeometry) {
                        child.position.x = startingPositions[meshIndex];
                        meshIndex++;
                    }
                });
            }

            renderer.render(scene, camera);
        }
        animate();
    },
    function(xhr) {
        console.log((xhr.loaded / xhr.total * 100) + '% loaded');
    },
    function(err) {
        console.error('An error occurred loading the font:', err);
    }
);

// Create a small button to show controls
const showControlsButton = document.createElement('button');
showControlsButton.id = 'show-controls-button';
showControlsButton.textContent = 'Show Controls';
showControlsButton.style.cssText = `
  position: fixed;
  top: 10px;
  right: 10px;
  background-color: rgba(0, 0, 0, 0.7);
  color: white;
  border: none;
  padding: 8px 12px;
  border-radius: 4px;
  cursor: pointer;
  z-index: 1001;
  font-family: Arial, sans-serif;
`;
document.body.appendChild(showControlsButton);

// Create a controls panel (completely hidden initially)
const controlsPanel = document.createElement('div');
controlsPanel.id = 'controls-panel';
controlsPanel.style.display = 'none'; // Completely hide it initially
controlsPanel.innerHTML = `
  <div class="panel-header">
    <h3>Lighting Controls</h3>
    <button id="hide-controls-button">Hide</button>
  </div>
  <div class="light-control">
    <h4>Center Light</h4>
    <div class="control-row">
      <label>Intensity: <span id="center-intensity-value">350</span></label>
      <input type="range" id="center-intensity" min="0" max="500" value="350" step="10">
    </div>
    <div class="control-row">
      <label>Color:</label>
      <input type="color" id="center-color" value="#ffffff">
    </div>
  </div>
  <div class="light-control">
    <h4>Left Light</h4>
    <div class="control-row">
      <label>Intensity: <span id="left-intensity-value">180</span></label>
      <input type="range" id="left-intensity" min="0" max="500" value="180" step="10">
    </div>
    <div class="control-row">
      <label>Color:</label>
      <input type="color" id="left-color" value="#0066ff">
    </div>
  </div>
  <div class="light-control">
    <h4>Right Light</h4>
    <div class="control-row">
      <label>Intensity: <span id="right-intensity-value">180</span></label>
      <input type="range" id="right-intensity" min="0" max="500" value="180" step="10">
    </div>
    <div class="control-row">
      <label>Color:</label>
      <input type="color" id="right-color" value="#0066ff">
    </div>
  </div>
  <div class="light-control">
    <h4>Back Light</h4>
    <div class="control-row">
      <label>Intensity: <span id="back-intensity-value">60</span></label>
      <input type="range" id="back-intensity" min="0" max="200" value="60" step="5">
    </div>
    <div class="control-row">
      <label>Color:</label>
      <input type="color" id="back-color" value="#ffcc00">
    </div>
  </div>
  <div class="light-control">
    <h4>Hair Light</h4>
    <div class="control-row">
      <label>Intensity: <span id="hair-intensity-value">100</span></label>
      <input type="range" id="hair-intensity" min="0" max="300" value="100" step="5">
    </div>
    <div class="control-row">
      <label>Color:</label>
      <input type="color" id="hair-color" value="#ffffff">
    </div>
  </div>
  <div class="save-settings">
    <button id="save-settings">Save Settings to Console</button>
  </div>
`;

// Add CSS for the controls panel
const style = document.createElement('style');
style.textContent = `
  #controls-panel {
    position: fixed;
    top: 10px;
    right: 10px;
    background-color: rgba(0, 0, 0, 0.7);
    color: white;
    padding: 15px;
    border-radius: 8px;
    width: 250px;
    font-family: Arial, sans-serif;
    z-index: 1000;
  }
  .panel-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 15px;
  }
  .panel-header h3 {
    margin: 0;
  }
  .light-control {
    margin-bottom: 15px;
    border-bottom: 1px solid #444;
    padding-bottom: 10px;
  }
  .light-control h4 {
    margin: 0 0 8px 0;
  }
  .control-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
  }
  input[type="range"] {
    width: 60%;
  }
  button {
    background-color: #555;
    color: white;
    border: none;
    padding: 5px 10px;
    border-radius: 4px;
    cursor: pointer;
  }
  button:hover {
    background-color: #666;
  }
  .save-settings {
    margin-top: 15px;
    text-align: center;
  }
  #save-settings {
    background-color: #2a6496;
    padding: 8px 15px;
    width: 100%;
  }
  #save-settings:hover {
    background-color: #3a7db6;
  }
`;

document.head.appendChild(style);
document.body.appendChild(controlsPanel);

// Add event listeners for the controls
document.addEventListener('DOMContentLoaded', () => {
  // Show controls button
  document.getElementById('show-controls-button').addEventListener('click', () => {
    document.getElementById('controls-panel').style.display = 'block';
    document.getElementById('show-controls-button').style.display = 'none';
  });
  
  // Hide controls button
  document.getElementById('hide-controls-button').addEventListener('click', () => {
    document.getElementById('controls-panel').style.display = 'none';
    document.getElementById('show-controls-button').style.display = 'block';
  });

  // Center light controls
  document.getElementById('center-intensity').addEventListener('input', (e) => {
    centerLight.intensity = parseFloat(e.target.value);
    document.getElementById('center-intensity-value').textContent = e.target.value;
  });
  document.getElementById('center-color').addEventListener('input', (e) => {
    centerLight.color.set(e.target.value);
  });

  // Left light controls
  document.getElementById('left-intensity').addEventListener('input', (e) => {
    leftLight.intensity = parseFloat(e.target.value);
    document.getElementById('left-intensity-value').textContent = e.target.value;
  });
  document.getElementById('left-color').addEventListener('input', (e) => {
    leftLight.color.set(e.target.value);
  });

  // Right light controls
  document.getElementById('right-intensity').addEventListener('input', (e) => {
    rightLight.intensity = parseFloat(e.target.value);
    document.getElementById('right-intensity-value').textContent = e.target.value;
  });
  document.getElementById('right-color').addEventListener('input', (e) => {
    rightLight.color.set(e.target.value);
  });

  // Back light controls
  document.getElementById('back-intensity').addEventListener('input', (e) => {
    yellowBackLight.intensity = parseFloat(e.target.value);
    document.getElementById('back-intensity-value').textContent = e.target.value;
  });
  document.getElementById('back-color').addEventListener('input', (e) => {
    yellowBackLight.color.set(e.target.value);
  });

  // Hair light controls
  document.getElementById('hair-intensity').addEventListener('input', (e) => {
    hairLight.intensity = parseFloat(e.target.value);
    document.getElementById('hair-intensity-value').textContent = e.target.value;
  });
  document.getElementById('hair-color').addEventListener('input', (e) => {
    hairLight.color.set(e.target.value);
  });

  // Add save settings button functionality
  document.getElementById('save-settings').addEventListener('click', () => {
    const settings = {
      centerLight: {
        color: centerLight.color.getHexString(),
        intensity: centerLight.intensity,
        position: [centerLight.position.x, centerLight.position.y, centerLight.position.z],
        angle: centerLight.angle,
        penumbra: centerLight.penumbra
      },
      leftLight: {
        color: leftLight.color.getHexString(),
        intensity: leftLight.intensity,
        position: [leftLight.position.x, leftLight.position.y, leftLight.position.z],
        angle: leftLight.angle,
        penumbra: leftLight.penumbra
      },
      rightLight: {
        color: rightLight.color.getHexString(),
        intensity: rightLight.intensity,
        position: [rightLight.position.x, rightLight.position.y, rightLight.position.z],
        angle: rightLight.angle,
        penumbra: rightLight.penumbra
      },
      backLight: {
        color: yellowBackLight.color.getHexString(),
        intensity: yellowBackLight.intensity,
        position: [yellowBackLight.position.x, yellowBackLight.position.y, yellowBackLight.position.z],
        angle: yellowBackLight.angle,
        penumbra: yellowBackLight.penumbra
      },
      hairLight: {
        color: hairLight.color.getHexString(),
        intensity: hairLight.intensity,
        position: [hairLight.position.x, hairLight.position.y, hairLight.position.z],
        angle: hairLight.angle,
        penumbra: hairLight.penumbra
      }
    };
    
    console.log('Current Light Settings:');
    console.log(JSON.stringify(settings, null, 2));
    
    // Also output code that can be directly copied into the source
    console.log('\nCopy-paste code for main.js:');
    console.log(`const centerLight = createSpotLight(0x${settings.centerLight.color}, ${settings.centerLight.intensity}, [${settings.centerLight.position.join(', ')}], ${settings.centerLight.angle}, ${settings.centerLight.penumbra});`);
    console.log(`const leftLight = createSpotLight(0x${settings.leftLight.color}, ${settings.leftLight.intensity}, [${settings.leftLight.position.join(', ')}], ${settings.leftLight.angle}, ${settings.leftLight.penumbra});`);
    console.log(`const rightLight = createSpotLight(0x${settings.rightLight.color}, ${settings.rightLight.intensity}, [${settings.rightLight.position.join(', ')}], ${settings.rightLight.angle}, ${settings.rightLight.penumbra});`);
    console.log(`const yellowBackLight = createSpotLight(0x${settings.backLight.color}, ${settings.backLight.intensity}, [${settings.backLight.position.join(', ')}], ${settings.backLight.angle}, ${settings.backLight.penumbra});`);
    console.log(`const hairLight = createSpotLight(0x${settings.hairLight.color}, ${settings.hairLight.intensity}, [${settings.hairLight.position.join(', ')}], ${settings.hairLight.angle}, ${settings.hairLight.penumbra});`);
    
    alert('Settings saved to console! Press F12 to view.');
  });
});
