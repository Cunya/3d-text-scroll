// Set up scene, camera, renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(30, window.innerWidth / window.innerHeight, 0.00001, 1000);
camera.position.set(0, 0, 20);
camera.lookAt(0, 0, 0);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

//function to create a spotlight
function createSpotLight(color, intensity, position, angle, penumbra) {
  const light = new THREE.SpotLight(color, intensity);
  light.position.set(position[0], position[1], position[2]);
  light.angle = angle;
  light.penumbra = penumbra;
  return light;
}

scene.add(createSpotLight(0xffffff,1,[0, 5, 10],Math.PI / 8, 0.5));
scene.add(createSpotLight(0x0000ff,1,[-10, 5, 10],Math.PI / 8, 0.5));
scene.add(createSpotLight(0x0000ff,1,[10, 5, 10],Math.PI / 8, 0.5));

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
const loader = new THREE.FontLoader();
loader.load('helvetiker_regular.typeface.json', function(font) {
  const textMaterial = new THREE.MeshPhongMaterial({ color: 0xffffff });
  
  let xPosition = 20;
  const startingPositions = [];

  wordsArray.forEach((word, index) => {
    const textGeometry = new THREE.TextGeometry(word, {
      font: font,
      size: 1.5,
      height: 0.4
    });

    textGeometry.computeVertexNormals();    
    // Compute bounding box before accessing its properties
    textGeometry.computeBoundingBox();

    const textMesh = new THREE.Mesh(textGeometry, textMaterial);
    textMesh.position.set(xPosition, 0, -10);
    scene.add(textMesh);

    // Log text content and position
    console.log(`Setting word "${word}" at position ${xPosition}`);

    // Get actual width of text geometry
    const textWidth = textGeometry.boundingBox.max.x - textGeometry.boundingBox.min.x;
    startingPositions.push(xPosition);
    xPosition += textWidth + 1; // Add padding between words
  });

  // Log starting positions
  console.log('Starting Positions:', startingPositions);

  // Animation loop
  const speed = 0.1;
  let allWordsExited = true;
  function animate() {
    requestAnimationFrame(animate);

    allWordsExited = true;
    let meshIndex = 0;
    scene.children.forEach((child) => {
      if (child.type === 'Mesh') {
        child.position.x -= speed;

        if (child.position.x >= -20) {
          allWordsExited = false;
        }

        meshIndex++;
      }
    });

    if (allWordsExited) {
      meshIndex = 0;
      scene.children.forEach((child) => {
        if (child.type === 'Mesh') {
          child.position.x = startingPositions[meshIndex];
          console.log(`Resetting word ${wordsArray[meshIndex]} to position ${startingPositions[meshIndex]}. Original word: ${wordsArray[meshIndex]}, original position: ${startingPositions[meshIndex]}`);
          meshIndex++;
        }
      });
    }

    renderer.render(scene, camera);
  }
  animate();
});
