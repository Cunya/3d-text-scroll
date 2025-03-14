// Import Three.js at the top of the file
import * as THREE from 'three';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

// Set up scene, camera, renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(30, window.innerWidth / window.innerHeight, 0.1, 1000);
// Move camera back and up slightly
camera.position.set(0, 5, 30);  // Reduced Z distance
camera.lookAt(0, 0, 0);
const renderer = new THREE.WebGLRenderer({ 
    antialias: true,
    alpha: false,
    precision: 'highp',
    logarithmicDepthBuffer: true  // Add depth buffer to help with z-fighting
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.NoToneMapping;  // Disable tone mapping temporarily
renderer.setPixelRatio(1.0);  // Use fixed pixel ratio for testing
document.body.appendChild(renderer.domElement);

// Add this after renderer setup
window.addEventListener('resize', onWindowResize, false);

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

//function to create a spotlight
function createSpotLight(color, intensity, position, angle, penumbra) {
    const light = new THREE.SpotLight(color, intensity);
    light.position.set(position[0], position[1], position[2]);
    light.angle = angle;
    light.penumbra = penumbra;
    light.distance = 100;
    light.decay = 1;
    light.intensity = intensity;
    
    // Create target at text level
    const targetObject = new THREE.Object3D();
    targetObject.position.set(position[0], 0, 0);
    scene.add(targetObject);
    light.target = targetObject;
    
    return light;
}

// Create ground plane to show light reflection
const groundGeometry = new THREE.PlaneGeometry(200, 200);
const groundMaterial = new THREE.MeshStandardMaterial({
    color: 0x111111,
    metalness: 0.2,
    roughness: 0.8
});
const ground = new THREE.Mesh(groundGeometry, groundMaterial);
ground.rotation.x = -Math.PI / 2;
ground.position.y = -3;
scene.add(ground);

// Update lights with new positions and intensities
const centerLight = createSpotLight(0xffffff, 80, [0, 15, 20], Math.PI / 4, 0.5);
const leftLight = createSpotLight(0x0055ff, 50, [-20, 15, 20], Math.PI / 4, 0.5);
const rightLight = createSpotLight(0x0055ff, 50, [20, 15, 20], Math.PI / 4, 0.5);

scene.add(centerLight);
scene.add(leftLight);
scene.add(rightLight);

// Add very dim ambient light
const ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
scene.add(ambientLight);

// Update text material to use MeshPhongMaterial instead of MeshStandardMaterial
const textMaterial = new THREE.MeshPhongMaterial({ 
    color: 0xffffff,
    specular: 0x222222,
    shininess: 20,
    flatShading: false
});

// Get reference to slider input
const cameraDistanceSlider = document.getElementById('cameraDistanceSlider');

// Get reference to camera z value display
const cameraZValueDisplay = document.getElementById('cameraZValue');

// Update camera position based on slider value
function updateCameraPosition() {
  const sliderValue = cameraDistanceSlider.value;
  const logScaledValue = Math.log(sliderValue) * 5; // Adjust scaling factor as needed
  const minDistance = 1; // Minimum allowed camera z-distance
  camera.position.z = Math.max(logScaledValue, minDistance);
  cameraZValueDisplay.innerText = `Camera Z: ${camera.position.z.toFixed(2)}`;
}
cameraDistanceSlider.addEventListener('input', updateCameraPosition);

const scrollText = `Artificial intelligence (AI), in its broadest sense, is intelligence exhibited by machines, particularly computer systems. It is a field of research in computer science that develops and studies methods and software that enable machines to perceive their environment and use learning and intelligence to take actions that maximize their chances of achieving defined goals.[1] Such machines may be called AIs.`;

const wordsArray = scrollText.split(' ');

// Create text meshes
const loader = new FontLoader();
loader.load(
    '/helvetiker_regular.typeface.json',
    function(font) {
        let xPosition = 20;
        const startingPositions = [];

        // Use PhongMaterial with moderate settings
        const textMaterial = new THREE.MeshPhongMaterial({ 
            color: 0xffffff,
            specular: 0x222222,
            shininess: 20,
            flatShading: false
        });

        wordsArray.forEach((word, index) => {
            const textGeometry = new TextGeometry(word, {
                font: font,
                size: 1.5,
                height: 0.3,  // Slightly reduced height
                curveSegments: 8,  // Moderate curve segments
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
            xPosition += textWidth + 1.5;
        });

        // Log starting positions
        console.log('Starting Positions:', startingPositions);

        // Animation loop
        const speed = 0.1;
        let allWordsExited = true;
        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true; // Add smooth damping
        controls.dampingFactor = 0.05;
        controls.screenSpacePanning = false;
        controls.minDistance = 10;
        controls.maxDistance = 100;
        controls.maxPolarAngle = Math.PI / 2; // Prevent going below the ground plane

        function animate() {
            requestAnimationFrame(animate);

            // Update controls
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
        // Progress callback
        console.log((xhr.loaded / xhr.total * 100) + '% loaded');
    },
    function(err) {
        // Error callback
        console.error('An error occurred loading the font:', err);
    }
);
