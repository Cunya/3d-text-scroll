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
// Original position: (0, 5, 30)
// 15% further: z = 30 * 1.15 = 34.5
// 20 degrees up from current position
const cameraDistance = 30 * 1.15; // 15% further
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
const centerLight = createSpotLight(0xffffff, 350, [0, 12, 15], Math.PI / 10, 0.6);  // Increased from 250 to 350
const leftLight = createSpotLight(0x0066ff, 180, [-8, 12, 15], Math.PI / 10, 0.6);   // Kept the same
const rightLight = createSpotLight(0x0066ff, 180, [8, 12, 15], Math.PI / 10, 0.6);   // Kept the same

scene.add(centerLight);
scene.add(leftLight);
scene.add(rightLight);

// Add extremely minimal ambient light just for visibility of form
const ambientLight = new THREE.AmbientLight(0xffffff, 0.01);  // Reduced to 0.01 (almost none)
scene.add(ambientLight);

// Get reference to slider input
const cameraDistanceSlider = document.getElementById('cameraDistanceSlider');
const cameraZValueDisplay = document.getElementById('cameraZValue');

function updateCameraPosition() {
  const sliderValue = cameraDistanceSlider.value;
  const logScaledValue = Math.log(sliderValue) * 5;
  const minDistance = 1;
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
            xPosition += textWidth + 1.5;
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
