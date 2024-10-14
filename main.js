// Set up scene, camera, renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Load words from file
const words = `Artificial intelligence (AI), in its broadest sense, is intelligence exhibited by machines, particularly computer systems. It is a field of research in computer science that develops and studies methods and software that enable machines to perceive their environment and use learning and intelligence to take actions that maximize their chances of achieving defined goals.[1] Such machines may be called AIs.`;

const wordsArray = words.split(' ');

// Create text meshes
const loader = new THREE.FontLoader();
loader.load('helvetiker_regular.typeface.json', function(font) {
  const textMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
  
  let xPosition = 10;
  
  wordsArray.forEach((word, index) => {
    const textGeometry = new THREE.TextGeometry(word, {
      font: font,
      size: 1,
      height: 0.1
    });
    const textMesh = new THREE.Mesh(textGeometry, textMaterial);
    textMesh.position.set(xPosition, 0, -10);
    scene.add(textMesh);
    
    xPosition += word.length;
  });
});

// Animation loop
const speed = 0.05;
function animate() {
  requestAnimationFrame(animate);
  
  scene.children.forEach(child => {
    if (child.type === 'Mesh') {
      child.position.x -= speed;
      
      if (child.position.x < -20) { // Updated condition to allow words to fully exit the screen
        child.position.x = 10;
      }
    }
  });
  
  renderer.render(scene, camera);
}
animate();
