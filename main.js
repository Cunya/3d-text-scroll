// Set up scene, camera, renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(30, window.innerWidth / window.innerHeight, 0.00001, 1000);
camera.position.set(0, 0, 10);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Get reference to slider input
const cameraDistanceSlider = document.getElementById('cameraDistanceSlider');

// Get reference to camera z value display
const cameraZValueDisplay = document.getElementById('cameraZValue');

// Update camera position based on slider value
function updateCameraPosition() {
  const sliderValue = cameraDistanceSlider.value;
  const logScaledValue = Math.log(sliderValue) * 5; // Adjust scaling factor as needed
  const minDistance = 5; // Minimum allowed camera z-distance
  camera.position.z = Math.max(logScaledValue, minDistance);
  cameraZValueDisplay.innerText = `Camera Z: ${camera.position.z.toFixed(2)}`;
}
cameraDistanceSlider.addEventListener('input', updateCameraPosition);

// Load words from file
const words = `Artificial intelligence (AI), in its broadest sense, is intelligence exhibited by machines, particularly computer systems. It is a field of research in computer science that develops and studies methods and software that enable machines to perceive their environment and use learning and intelligence to take actions that maximize their chances of achieving defined goals.[1] Such machines may be called AIs.`;

const wordsArray = words.split(' ');

// Create text meshes
const loader = new THREE.FontLoader();
loader.load('helvetiker_regular.typeface.json', function(font) {
  const textMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
  
  let xPosition = -10;
  const startingPositions = [];

  wordsArray.forEach((word, index) => {
    const textGeometry = new THREE.TextGeometry(word, {
      font: font,
      size: 1.5,
      height: 0.2
    });
    const textMesh = new THREE.Mesh(textGeometry, textMaterial);
    textMesh.position.set(xPosition, -2, 0);
    scene.add(textMesh);

    startingPositions.push(xPosition);
    xPosition += word.length * 1.5;
  });

  // Animation loop
  const speed = 0.05;
  let allWordsExited = true;
  function animate() {
    requestAnimationFrame(animate);

    allWordsExited = true;
    scene.children.forEach((child, index) => {
      if (child.type === 'Mesh') {
        child.position.x -= speed;

        if (child.position.x >= -20) {
          allWordsExited = false;
        }
      }
    });

    if (allWordsExited) {
      scene.children.forEach((child, index) => {
        if (child.type === 'Mesh') {
          child.position.x = startingPositions[index];
        }
      });
    }

    renderer.render(scene, camera);
  }
  animate();
});
