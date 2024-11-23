// Setup Scene
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Add Orbit Controls for easier navigation
const controls = new THREE.OrbitControls(camera, renderer.domElement);

// Create a simple ground for the city streets
const geometry = new THREE.PlaneGeometry(500, 500);
const material = new THREE.MeshBasicMaterial({ color: 0xAAAAAA, side: THREE.DoubleSide });
const ground = new THREE.Mesh(geometry, material);
ground.rotation.x = - Math.PI / 2;
scene.add(ground);

// Add simple buildings (could be replaced with models)
function createBuilding(x, z) {
    const buildingGeometry = new THREE.BoxGeometry(10, Math.random() * 50 + 10, 10);
    const buildingMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    const building = new THREE.Mesh(buildingGeometry, buildingMaterial);
    building.position.set(x, building.geometry.parameters.height / 2, z);
    scene.add(building);
}

// Create several buildings in the city
for (let i = -200; i < 200; i += 50) {
    for (let j = -200; j < 200; j += 50) {
        createBuilding(i, j);
    }
}

// Create a basic player car (simple cube for now)
const carGeometry = new THREE.BoxGeometry(4, 2, 8);
const carMaterial = new THREE.MeshBasicMaterial({ color: 0x0000FF });
const car = new THREE.Mesh(carGeometry, carMaterial);
car.position.y = 1;
scene.add(car);

// Create AI Cop cars (basic cubes)
const copGeometry = new THREE.BoxGeometry(4, 2, 8);
const copMaterial = new THREE.MeshBasicMaterial({ color: 0xFF0000 });
const cop = new THREE.Mesh(copGeometry, copMaterial);
cop.position.set(50, 1, 50);
scene.add(cop);

// NPCs (simple spheres for now)
function createNPC(x, z) {
    const npcGeometry = new THREE.SphereGeometry(1);
    const npcMaterial = new THREE.MeshBasicMaterial({ color: 0x00FFFF });
    const npc = new THREE.Mesh(npcGeometry, npcMaterial);
    npc.position.set(x, 1, z);
    scene.add(npc);
}

// Create several NPCs
for (let i = -200; i < 200; i += 40) {
    for (let j = -200; j < 200; j += 40) {
        createNPC(i, j);
    }
}

// Car controls
const carSpeed = 0.1;
const carDirection = new THREE.Vector3(0, 0, 0);
let carVelocity = new THREE.Vector3(0, 0, 0);
let forward = false;
let backward = false;
let left = false;
let right = false;

window.addEventListener("keydown", (event) => {
    if (event.key === "w") forward = true;
    if (event.key === "s") backward = true;
    if (event.key === "a") left = true;
    if (event.key === "d") right = true;
});

window.addEventListener("keyup", (event) => {
    if (event.key === "w") forward = false;
    if (event.key === "s") backward = false;
    if (event.key === "a") left = false;
    if (event.key === "d") right = false;
});

// Update car position based on controls
function updateCar() {
    if (forward) carVelocity.z -= carSpeed;
    if (backward) carVelocity.z += carSpeed;
    if (left) car.rotation.y += 0.05;
    if (right) car.rotation.y -= 0.05;

    car.position.add(carVelocity);
    carVelocity.z *= 0.95; // Simulate friction

    // Detect AI cops (basic logic for proximity)
    scene.children.forEach((obj) => {
        if (obj !== car && obj !== ground && obj !== cop && obj !== npc) {
            if (obj.position.distanceTo(car.position) < 20) {
                // Cop AI will start chasing the player if it's too close
                const direction = car.position.clone().sub(obj.position).normalize();
                obj.position.add(direction.multiplyScalar(0.05));
            }
        }
    });
}

// Camera position and rendering
camera.position.set(0, 10, 50);
camera.lookAt(0, 10, 0);

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    controls.update();
    updateCar();
    renderer.render(scene, camera);
}

animate();
