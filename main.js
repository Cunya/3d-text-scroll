// ... imports

// Create scene, camera, and renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Load font from local file
const fontLoader = new THREE.FontLoader();
fontLoader.load('helvetiker_regular.typeface.json', function (font) {
  const geometry = new THREE.TextGeometry('Hello, World!', {
    font: font,
    size: 1,
    height: 0.1,
    curveSegments: 12,
    bevelEnabled: true,
    bevelThickness: 0.1,
    bevelSize: 0.1,
    bevelSegments: 1
  });
  const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
  const textMesh = new THREE.Mesh(geometry, material);
  scene.add(textMesh);

  // Add ambient light
  const ambientLight = new THREE.AmbientLight(0xffffff, 1);
  scene.add(ambientLight);

  // Position the camera and text
  camera.position.z = 5;
  textMesh.position.x = -2;

  // Scroll animation
  function animate() {
    requestAnimationFrame(animate);
    textMesh.position.x += 0.01;
    if (textMesh.position.x > 2) {
      textMesh.position.x = -2;
    }
    renderer.render(scene, camera);
  }
  animate();
}, undefined, function (error) {
  console.error('Font loading failed:', error);
});
