import * as THREE from './three.module.min.js'; 
import { OrbitControls } from './orbitcontrols.js'; 

let scene, camera, renderer, controls;
let earth; 
let venus;
let mars;
let mercury;
const neos = []; 
let animationSpeed = 0.5; // Base speed for NEO animations
const textureLoader = new THREE.TextureLoader(); // Texture loader for Sun and Earth
let solarSystemGroup; // Group for solar system objects
let earthLabel;
let venusLabel;
let marsLabel;
let mercuryLabel;// Variable to hold the Earth label
let animationearth = 1;
let currentNeoIndex = 0; // Keep track of the current NEO index
const nPerFetch = 10; // Number of NEOs to fetch each time


const apiKey = 'ASG4LGoAB7zG3a7hkknh3K35FK68ijpuH8tfEBbY'; 
let page = 0;
const neoUrl = `https://api.nasa.gov/neo/rest/v1/neo/browse?api_key=${apiKey}`;

function init() {
    // Initialize scene, camera, and renderer
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000); // Set camera FOV to 75
    camera.position.set(0, 100, 300); // Position the camera fixed above the solar system

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    // Initialize controls on solar system group
    solarSystemGroup = new THREE.Group();
    scene.add(solarSystemGroup); // Add solar system group to the scene

    controls = new OrbitControls(solarSystemGroup, renderer.domElement);
    controls.enableZoom = true; // Disable zoom
    controls.enablePan = false; // Disable panning
    controls.enableDamping = true; // Enable damping (inertia)
    controls.dampingFactor = 0.25; // Set damping factor

    // Add ambient light for better visibility
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5); // Soft white light
    scene.add(ambientLight);

    // Add directional light for shading
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5); // Directional light
    directionalLight.position.set(1, 1, 1).normalize();
    scene.add(directionalLight);

    createStarryBackground(); // Create starry background
    createSun(); // Create the Sun
    createEarth(); 
    createMars();   // New function for Mars
    createVenus();  // New function for Venus
    createMercury(); // New function for Mercury// Create Earth

    document.addEventListener('keydown', handleKeyDown, false);
    window.addEventListener('resize', onWindowResize, false); // Handle window resize
    document.getElementById('zoomIn').addEventListener('click', zoomIn); // Zoom In button
    document.getElementById('zoomOut').addEventListener('click', zoomOut); // Zoom Out button
    document.getElementById('toggleOrbits').addEventListener('click', toggleOrbits); // Toggle orbits visibility
    document.getElementById('resetPositions').addEventListener('click', resetNEOs); // Reset NEO positions
    document.getElementById('increaseSpeed').addEventListener('click', () => changeAnimationSpeed(1.2)); // Increase speed button
    document.getElementById('decreaseSpeed').addEventListener('click', () => changeAnimationSpeed(0.7)); // Decrease speed button
    document.getElementById('loadMoreNEOs').addEventListener('click', loadMoreNEOs);
    document.getElementById('previousNEOs').addEventListener('click', loadPreviousNEOs);
    animate(); // Start the animation loop
}

function handleKeyDown(event) {
    const keyName = event.key;

    // Adjust camera position based on key pressed
    switch (keyName) {
        case 'ArrowUp':
            camera.position.y += 1; // Move up
            break;
        case 'ArrowDown':
            camera.position.y -= 1; // Move down
            break;
        case 'ArrowLeft':
            camera.position.x -= 1; // Move left
            break;
        case 'ArrowRight':
            camera.position.x += 1; // Move right
            break;
        case 'w': // Forward
            camera.position.z -= 1;
            break;
        case 's': // Backward
            camera.position.z += 1;
            break;
        case 'a': // Strafe left
            camera.position.x -= 1;
            break;
        case 'd': // Strafe right
            camera.position.x += 1;
            break;
    }
}




// Add floating name for celestial objects
function createFloatingLabel(text, position) {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    const fontSize = 60; // Increased font size
    canvas.width = 800; // Width of the canvas
    canvas.height = 100; // Height of the canvas

    context.font = `Bolder ${fontSize}px Arial`;
    context.fillStyle = 'white';
    context.fillText(text, 10, fontSize); // Add some padding from the top

    const texture = new THREE.CanvasTexture(canvas);
    const spriteMaterial = new THREE.SpriteMaterial({ map: texture, depthTest: false }); // Ensure depth test is false
    const sprite = new THREE.Sprite(spriteMaterial);
    sprite.scale.set(90, 15, 1); // Adjust the size of the label
    sprite.position.copy(position.clone().add(new THREE.Vector3(0, 40, 0))); // Position label above the object
    return sprite; // Return the label sprite
}

// Create a starry background
function createStarryBackground() {
    const texture = textureLoader.load('stars.jpg'); // Load starry background texture
    const backgroundGeometry = new THREE.SphereGeometry(500, 32, 32); // Large sphere
    const backgroundMaterial = new THREE.MeshBasicMaterial({
        map: texture,
        side: THREE.BackSide // Make the material visible from the inside
    });
    const background = new THREE.Mesh(backgroundGeometry, backgroundMaterial);
    scene.add(background); // Add the background to the scene
}

function createSun() {
    const sunGeometry = new THREE.SphereGeometry(30, 32, 32); // Size of the Sun
    const sunTexture = textureLoader.load('sun.jpg'); // Load Sun texture
    const sunMaterial = new THREE.MeshBasicMaterial({ map: sunTexture });
    const sun = new THREE.Mesh(sunGeometry, sunMaterial);
    solarSystemGroup.add(sun); // Add Sun to the solar system group

    // Create and store the label for Sun
    const sunLabel = createFloatingLabel('Sun', sun.position); // Create label for Sun
    solarSystemGroup.add(sunLabel); // Attach label to solar system group

    // Position the label above the Sun
    sunLabel.position.copy(sun.position.clone().add(new THREE.Vector3(2, 25, 0))); // Position label above the Sun
}

function createEarth() {
    const earthGeometry = new THREE.SphereGeometry(17, 32, 32); // Adjusted radius for Earth
    const earthTexture = textureLoader.load('earth.jpg'); // Load Earth texture
    const earthMaterial = new THREE.MeshBasicMaterial({ map: earthTexture });
    earth = new THREE.Mesh(earthGeometry, earthMaterial);
    earth.position.set(110, 0, 0); // Reduced initial position for Earth's orbit
    solarSystemGroup.add(earth); // Add Earth to the solar system group

    // Create and store the label for Earth
    earthLabel = createFloatingLabel('Earth', earth.position); // Create label for Earth
    solarSystemGroup.add(earthLabel); // Attach label to solar system group

    // Add orbit line for Earth
    addOrbitLineAroundEarth(110); // Added orbit line for Earth

    // Initialize Earth's angle for animation
    earth.angle = 0;
}

function createMars() {
    const marsGeometry = new THREE.SphereGeometry(10, 32, 32); // Adjusted radius for Mars
    const marsTexture = textureLoader.load('mars.jpg'); // Load Mars texture
    const marsMaterial = new THREE.MeshBasicMaterial({ map: marsTexture });
    mars = new THREE.Mesh(marsGeometry, marsMaterial);
    mars.position.set(140, 0, 0); // Position for Mars's orbit
    solarSystemGroup.add(mars); // Add Mars to the solar system group

    // Create and store the label for Mars
    marsLabel = createFloatingLabel('Mars', mars.position); // Create label for Mars
    solarSystemGroup.add(marsLabel); // Attach label to solar system group

    // Add orbit line for Mars
    addOrbitLineAroundEarth(140); 

    // Initialize Mars's angle for animation
    mars.angle = 0;
}

function createVenus() {
    const venusGeometry = new THREE.SphereGeometry(12, 32, 32); // Adjusted radius for Venus
    const venusTexture = textureLoader.load('venus.jpg'); // Load Venus texture
    const venusMaterial = new THREE.MeshBasicMaterial({ map: venusTexture });
    venus = new THREE.Mesh(venusGeometry, venusMaterial);
    venus.position.set(75, 0, 0); // Position for Venus's orbit
    solarSystemGroup.add(venus); // Add Venus to the solar system group

    // Create and store the label for Venus
    venusLabel = createFloatingLabel('Venus', venus.position); // Create label for Venus
    solarSystemGroup.add(venusLabel); // Attach label to solar system group

    // Add orbit line for Venus
    addOrbitLineAroundEarth(75); // Added orbit line for Venus

    // Initialize Venus's angle for animation
    venus.angle = 0;
}

function createMercury() {
    const mercuryGeometry = new THREE.SphereGeometry(8, 32, 32); // Adjusted radius for Mercury
    const mercuryTexture = textureLoader.load('mercury.jpg'); // Load Mercury texture
    const mercuryMaterial = new THREE.MeshBasicMaterial({ map: mercuryTexture });
    mercury = new THREE.Mesh(mercuryGeometry, mercuryMaterial);
    mercury.position.set(50, 0, 0); // Position for Mercury's orbit
    solarSystemGroup.add(mercury); // Add Mercury to the solar system group

    // Create and store the label for Mercury
    mercuryLabel = createFloatingLabel('Mercury', mercury.position); // Create label for Mercury
    solarSystemGroup.add(mercuryLabel); // Attach label to solar system group

    // Add orbit line for Mercury
    addOrbitLineAroundEarth(50); // Added orbit line for Mercury

    // Initialize Mercury's angle for animation
    mercury.angle = 0;
}
function addOrbitLineAroundPlanet(distance) {
    const points = [];
    const numPoints = 100; // Number of points to create for the orbit line

    // Create a circle using parametric equations
    for (let i = 0; i <= numPoints; i++) {
        const angle = (i / numPoints) * Math.PI * 2; // Full circle in radians
        const x = distance * Math.cos(angle);
        const y = distance * Math.sin(angle);
        points.push(new THREE.Vector3(x, 0, y)); // Set y to 0 for a flat orbit
    }

    // Create a geometry from the points
    const orbitGeometry = new THREE.BufferGeometry().setFromPoints(points);
    const orbitMaterial = new THREE.LineBasicMaterial({ color: 0xFFFFFF, opacity: 0.5, transparent: true });
    
    const orbitLine = new THREE.LineLoop(orbitGeometry, orbitMaterial);
    solarSystemGroup.add(orbitLine); // Add orbit line to solar system group
}


// Clear previously displayed NEOs from the scene
function clearPreviousNEOs() {
    neos.forEach((neo) => {
        solarSystemGroup.remove(neo.mesh); // Remove the NEO mesh
        solarSystemGroup.remove(neo.orbitLine); // Remove the orbit line
        solarSystemGroup.remove(neo.label); // Remove the label
    });
    neos.length = 0; // Clear the neos array
}

async function fetchNEOs(startIndex = 0) {
    try {
        const response = await fetch(`${neoUrl}&page=${page}`); // Include page in API call
        const data = await response.json();
        const neosData = data.near_earth_objects; // Get the NEOs data array

        // Sort the NEOs by their miss distance (closest to farthest)
        const sortedNEOs = neosData.sort((a, b) => {
            const distanceA = parseFloat(a.close_approach_data[0].miss_distance.kilometers);
            const distanceB = parseFloat(b.close_approach_data[0].miss_distance.kilometers);
            return distanceA - distanceB;
        });
        const neoTableData = [];

        // Fetch the new NEOs based on the startIndex and nPerFetch
        for (const neoData of sortedNEOs.slice(startIndex, startIndex + nPerFetch)) {
            const name = neoData.name;
            const eccentricity = neoData.orbital_data.eccentricity;
            const semiMajorAxis = neoData.orbital_data.semi_major_axis; // Get semi-major axis in AU
            const semiMinorAxis = semiMajorAxis * Math.sqrt(1 - eccentricity ** 2); // Calculate semi-minor axis
            const inclination = neoData.orbital_data.inclination; // Orbital inclination
            const relativeVelocity = parseFloat(neoData.close_approach_data[0].relative_velocity.kilometers_per_second); // Use neoData instead of neo
            const speed = (relativeVelocity / 2000);
            const estimatedDiameterMeters = neoData.estimated_diameter.meters.estimated_diameter_max;
            const orbitingBody = neoData.close_approach_data[0].orbiting_body;
            const isPotentiallyHazardous = neoData.is_potentially_hazardous_asteroid;

            // Push NEO data into the table array
            neoTableData.push({
                name: name,
                estimated_diameter_meters: estimatedDiameterMeters,
                eccentricity: eccentricity,
                inclination: inclination,
                relative_velocity: relativeVelocity, // Add Relative Velocity
                orbiting_body: orbitingBody,
                is_potentially_hazardous: isPotentiallyHazardous
            });
            const neo = createNEO(name, eccentricity, semiMajorAxis, semiMinorAxis, inclination, speed); // Ensure speed is passed
            neos.push(neo);
            solarSystemGroup.add(neo.mesh); // Add NEO mesh to the solar system group
            solarSystemGroup.add(neo.orbitLine); // Add NEO orbit line to the solar system group
            solarSystemGroup.add(neo.label); // Add NEO label to the solar system group
        }

        // Add NEO data to the table
        addNEOToTable(neoTableData);
        // Update the current index for the next fetch
        if (sortedNEOs.length >= nPerFetch) {
            page++; // Move to the next page for the next batch
        } else {
            // Disable or hide the load more button if there are no more NEOs
            document.getElementById('loadMoreNEOs').disabled = true; // Disable the button if no more NEOs
        }

    } catch (error) {
        console.error('Error fetching NEOs:', error);
    }
}

// Function to load more NEOs (pagination)
async function loadMoreNEOs() {
    clearPreviousNEOs();
    await fetchNEOs(currentNeoIndex);
    console.log(page); // Fetch the next batch of NEOs
}
async function loadPreviousNEOs() {
    if(page==1) page=1;
    if (page > 1) {
        page=page-2; // Move to the previous page
        clearPreviousNEOs(); // Clear the current NEOs from the scene
        await fetchNEOs(currentNeoIndex); // Fetch and display the previous batch of NEOs
    } else {
        console.log('No previous NEOs to load'); // Log message for no previous NEOs
    }
    console.log(page);
}

console.log(page);


// Call the initial fetch with index 0
fetchNEOs(currentNeoIndex); // Initial load


// Create a NEO (Near-Earth Object) with given parameters
function createNEO(name, eccentricity, semiMajorAxis, semiMinorAxis, inclination, speed) {
    const neoGeometry = new THREE.SphereGeometry(3, 32, 32); // NEOs are smaller than planets
    const neoMaterial = new THREE.MeshBasicMaterial({ color: 0xcccccc });
    const neoMesh = new THREE.Mesh(neoGeometry, neoMaterial);

    // Initialize NEO's position and orbital properties
    neoMesh.angle = Math.random() * Math.PI * 2; // Random starting angle
    neoMesh.eccentricity = eccentricity;
    neoMesh.semiMajorAxis = semiMajorAxis * 150; // Scale the semi-major axis for visualization
    neoMesh.semiMinorAxis = semiMinorAxis * 150; // Scale the semi-minor axis for visualization
    neoMesh.inclination = inclination; // Keep this for potential use later
    neoMesh.speed = speed; // Assign the speed to neoMesh

    const neoPosition = new THREE.Vector3(
        neoMesh.semiMajorAxis * Math.cos(neoMesh.angle),
        0, // Set Y position to 0
        neoMesh.semiMinorAxis * Math.sin(neoMesh.angle)
    );
    neoMesh.position.copy(neoPosition);

    // Create the orbit line
    const orbitLine = createOrbitLine(neoMesh.semiMajorAxis, neoMesh.semiMinorAxis, 0); // Set inclination to 0
    orbitLine.position.set(0, 0, 0); // Orbit line is centered around the origin

    // Create a floating label for the NEO
    const neoLabel = createFloatingLabel(name, neoMesh.position);
    return { mesh: neoMesh, orbitLine, label: neoLabel };
}



// Create an elliptical orbit line for NEOs
function createOrbitLine(semiMajorAxis, semiMinorAxis, inclination) {
    const numSegments = 128;
    const orbitPoints = [];

    for (let i = 0; i <= numSegments; i++) {
        const theta = (i / numSegments) * Math.PI * 2;
        const x = semiMajorAxis * Math.cos(theta);
        const z = semiMinorAxis * Math.sin(theta);
        orbitPoints.push(new THREE.Vector3(x, 0, z)); // Y position is 0 for flat orbit
    }

    const orbitGeometry = new THREE.BufferGeometry().setFromPoints(orbitPoints);
    const orbitMaterial = new THREE.LineBasicMaterial({ color: 0xffcc00 });
    const orbitLine = new THREE.Line(orbitGeometry, orbitMaterial);
    // No rotation for the orbit since it's flat
    return orbitLine;
}


// Function to reset NEO positions to initial values
function resetNEOs() {
    neos.forEach((neo) => {
        neo.mesh.angle = Math.random() * Math.PI * 2; // Reset the starting angle for each NEO
        const neoPosition = new THREE.Vector3(
            neo.mesh.semiMajorAxis * Math.cos(neo.mesh.angle),
            0,
            neo.mesh.semiMinorAxis * Math.sin(neo.mesh.angle)
        );
        neo.mesh.position.copy(neoPosition); // Reset position based on initial angle
        neo.label.position.copy(neo.mesh.position.clone().add(new THREE.Vector3(0, 25, 0))); // Move label accordingly
    });
}

// Function to zoom in
function zoomIn() {
    camera.position.z -= 10; // Move the camera closer
    controls.update(); // Update the controls
}

// Function to zoom out
function zoomOut() {
    camera.position.z += 10; // Move the camera farther away
    controls.update(); // Update the controls
}



function changeAnimationSpeed(multiplier) {
    animationSpeed *= multiplier;
}


// Toggle visibility of NEO orbits
function toggleOrbits() {
    neos.forEach((neo) => {
        neo.orbitLine.visible = !neo.orbitLine.visible; // Toggle orbit visibility
    });
}

// Add an elliptical orbit around Earth
function addOrbitLineAroundEarth(semiMajorAxis) {
    const semiMinorAxis = semiMajorAxis * 0.8; // Set the semi-minor axis slightly smaller
    const numSegments = 128;
    const orbitPoints = [];

    for (let i = 0; i <= numSegments; i++) {
        const theta = (i / numSegments) * Math.PI * 2;
        const x = semiMajorAxis * Math.cos(theta);
        const z = semiMinorAxis * Math.sin(theta);
        orbitPoints.push(new THREE.Vector3(x, 0, z));
    }

    const orbitGeometry = new THREE.BufferGeometry().setFromPoints(orbitPoints);
    const orbitMaterial = new THREE.LineBasicMaterial({ color: 0x00ccff });
    const orbitLine = new THREE.Line(orbitGeometry, orbitMaterial);
    solarSystemGroup.add(orbitLine);
}

// Function to animate the solar system
function animate() {
    requestAnimationFrame(animate); // Call animate recursively
    controls.update(); // Update the OrbitControls

    animateEarth();
    animateMars();
    animateMercury();
    animateVenus();// Animate Earth's orbit
    animateNEOs(); // Animate NEOs

    renderer.render(scene, camera); // Render the scene
}

// Function to animate the Earth's orbit
function animateEarth() {
    earth.angle += 0.005 * animationearth; // Adjust Earth's angle in orbit
    earth.position.x = 110 * Math.cos(earth.angle); // Update Earth's X position
    earth.position.z = 90 * Math.sin(earth.angle); // Update Earth's Z position
    earthLabel.position.copy(earth.position.clone().add(new THREE.Vector3(0, 25, 0))); // Update the Earth label position
}
function animateMercury() {
    mercury.angle += 0.008 * animationearth; // Adjust Earth's angle in orbit
    mercury.position.x = 50 * Math.cos(mercury.angle); // Update Earth's X position
    mercury.position.z = 40 * Math.sin(mercury.angle); // Update Earth's Z position
    mercuryLabel.position.copy(mercury.position.clone().add(new THREE.Vector3(0, 25, 0))); // Update the Earth label position
}
function animateVenus() {
    venus.angle += 0.007 * animationearth; // Adjust Earth's angle in orbit
    venus.position.x = 75 * Math.cos(venus.angle); // Update Earth's X position
    venus.position.z = 55 * Math.sin(venus.angle); // Update Earth's Z position
    venusLabel.position.copy(venus.position.clone().add(new THREE.Vector3(0, 25, 0))); // Update the Earth label position
}
function animateMars() {
    mars.angle += 0.009 * animationearth; // Adjust Earth's angle in orbit
    mars.position.x = 140 * Math.cos(mars.angle); // Update Earth's X position
    mars.position.z = 120 * Math.sin(mars.angle); // Update Earth's Z position
    marsLabel.position.copy(mars.position.clone().add(new THREE.Vector3(0, 25, 0))); // Update the Earth label position
}

// Function to animate NEOs around the Sun
function animateNEOs() {
    neos.forEach((neo) => {
        neo.mesh.angle += neo.mesh.speed * animationSpeed; // Increment the angle for the NEO's rotation

        // Calculate new 3D positions based on their orbital parameters
        neo.mesh.position.x = neo.mesh.semiMajorAxis * Math.cos(neo.mesh.angle); // X position
        neo.mesh.position.z = neo.mesh.semiMinorAxis * Math.sin(neo.mesh.angle); // Z position
        neo.mesh.position.y = 0; // Set Y position to 0

        neo.label.position.copy(neo.mesh.position.clone().add(new THREE.Vector3(0, 25, 0))); // Position the label above the NEO
    });
}



// Handle window resize event
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

init(); // Initialize the scene
