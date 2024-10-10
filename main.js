// Set up scene, camera, renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Load words from file
const words = `Hello
World
Three.js
Animation`;

const wordsArray = words.split('\n');

// Create text meshes
const loader = new THREE.FontLoader();
loader.load('helvetiker_regular.typeface.json', function(font) {
  const textMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
  
  wordsArray.forEach((word, index) => {
    const textGeometry = new THREE.TextGeometry(word, {
      font: font,
      size: 1,
      height: 0.1
    });
    const textMesh = new THREE.Mesh(textGeometry, textMaterial);
    textMesh.position.set(10 + index * 5, 0, -10);
    scene.add(textMesh);
  });
});

// Animation loop
const speed = 0.05;
function animate() {
  requestAnimationFrame(animate);
  
  scene.children.forEach(child => {
    if (child.type === 'Mesh') {
      child.position.x -= speed;
      
      if (child.position.x < -10) {
        child.position.x = 10;
      }
    }
  });
  
  renderer.render(scene, camera);
}
animate();
