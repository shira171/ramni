// using global THREE variable from script tags

// --- Configuration ---
const images = [
    'WhatsApp Image 2026-02-12 at 10.56.40 AM.jpeg',
    'WhatsApp Image 2026-02-12 at 10.56.41 AM (1).jpeg',
    'WhatsApp Image 2026-02-12 at 10.56.41 AM (2).jpeg',
    'WhatsApp Image 2026-02-12 at 10.56.41 AM (3).jpeg',
    'WhatsApp Image 2026-02-12 at 10.56.41 AM (4).jpeg',
    'WhatsApp Image 2026-02-12 at 10.56.41 AM (5).jpeg',
    'WhatsApp Image 2026-02-12 at 10.56.41 AM (6).jpeg',
    'WhatsApp Image 2026-02-12 at 10.56.41 AM (7).jpeg',
    'WhatsApp Image 2026-02-12 at 10.56.41 AM (8).jpeg',
    'WhatsApp Image 2026-02-12 at 10.56.41 AM (9).jpeg',
    'WhatsApp Image 2026-02-12 at 10.56.41 AM (10).jpeg',
    'WhatsApp Image 2026-02-12 at 10.56.41 AM (11).jpeg',
    'WhatsApp Image 2026-02-12 at 10.56.41 AM (12).jpeg',
    'WhatsApp Image 2026-02-12 at 10.56.41 AM.jpeg'
];

// --- Scene Setup ---
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.toneMapping = THREE.ReinhardToneMapping;
document.getElementById('canvas-container').appendChild(renderer.domElement);

// --- Post Processing (Bloom) ---
const renderScene = new THREE.RenderPass(scene, camera);

const bloomPass = new THREE.UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 1.5, 0.4, 0.85);
bloomPass.threshold = 0.3; // Increased threshold to reduce overall bloom
bloomPass.strength = 0.8; // Reduced strength
bloomPass.radius = 0.5;

const composer = new THREE.EffectComposer(renderer);
composer.addPass(renderScene);
composer.addPass(bloomPass);

// Fog for depth
scene.fog = new THREE.FogExp2(0x050510, 0.025);

// --- Lighting ---
const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(ambientLight);

const pointLight = new THREE.PointLight(0xff4d6d, 1.5, 50);
pointLight.position.set(0, 5, 5);
scene.add(pointLight);

// --- Particles (Stars/Magic Dust) ---
const particlesGeometry = new THREE.BufferGeometry();
const particlesCount = 3000;
const posArray = new Float32Array(particlesCount * 3);
const colorsArray = new Float32Array(particlesCount * 3);

for (let i = 0; i < particlesCount * 3; i += 3) {
    posArray[i] = (Math.random() - 0.5) * 60;
    posArray[i + 1] = (Math.random() - 0.5) * 60;
    posArray[i + 2] = (Math.random() - 0.5) * 60;

    const colorType = Math.random();
    if (colorType < 0.33) {
        colorsArray[i] = 1; colorsArray[i + 1] = 0.3; colorsArray[i + 2] = 0.4;
    } else if (colorType < 0.66) {
        colorsArray[i] = 1; colorsArray[i + 1] = 0.8; colorsArray[i + 2] = 0.2;
    } else {
        colorsArray[i] = 0.2; colorsArray[i + 1] = 0.8; colorsArray[i + 2] = 1;
    }
}

particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
particlesGeometry.setAttribute('color', new THREE.BufferAttribute(colorsArray, 3));

const particlesMaterial = new THREE.PointsMaterial({
    size: 0.1,
    vertexColors: true,
    transparent: true,
    opacity: 0.8,
    blending: THREE.AdditiveBlending
});

const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
scene.add(particlesMesh);

// --- Photo Gallery (Floating Planes) ---
const photoGroup = new THREE.Group();
scene.add(photoGroup);

const textureLoader = new THREE.TextureLoader();
const galleryRadius = 9;
const galleryMeshes = [];

images.forEach((img, i) => {
    textureLoader.load(img, (texture) => {
        const aspect = texture.image.width / texture.image.height;
        const geometry = new THREE.PlaneGeometry(3, 3 / aspect);

        // Use MeshStandardMaterial with reduced emissive to lower brightness
        const material = new THREE.MeshStandardMaterial({
            map: texture,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.85,
            emissive: 0x000000,
            emissiveIntensity: 0,
            metalness: 0.1,
            roughness: 0.8
        });

        const mesh = new THREE.Mesh(geometry, material);

        const angle = (i / images.length) * Math.PI * 2;
        const y = -i * 2;

        mesh.position.set(
            Math.cos(angle) * galleryRadius,
            y,
            Math.sin(angle) * galleryRadius
        );

        mesh.lookAt(0, y, 0);
        mesh.rotation.y += Math.PI;

        mesh.userData = {
            originalY: y,
            floatSpeed: 0.005 + Math.random() * 0.01,
            floatOffset: Math.random() * Math.PI * 2,
            isZoomed: false
        };

        mesh.callback = () => toggleZoom(mesh);

        galleryMeshes.push(mesh);
        photoGroup.add(mesh);
    });
});

photoGroup.position.y = 5;

// --- Interaction Logic (Raycaster) ---
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

function onMouseClick(event) {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(galleryMeshes);

    if (intersects.length > 0) {
        intersects[0].object.callback();
    }
}
window.addEventListener('click', onMouseClick);

// Toggle Zoom Function
let currentZoomedMesh = null;
function toggleZoom(mesh) {
    if (mesh.userData.isZoomed) {
        gsap.to(mesh.position, {
            x: Math.cos((galleryMeshes.indexOf(mesh) / images.length) * Math.PI * 2) * galleryRadius,
            y: mesh.userData.originalY,
            z: Math.sin((galleryMeshes.indexOf(mesh) / images.length) * Math.PI * 2) * galleryRadius,
            duration: 1,
            ease: "power2.inOut"
        });
        gsap.to(mesh.rotation, {
            y: Math.atan2(mesh.position.x, mesh.position.z) + Math.PI,
            duration: 1
        });
        gsap.to(mesh.scale, { x: 1, y: 1, z: 1, duration: 1 });
        mesh.userData.isZoomed = false;
        currentZoomedMesh = null;
    } else {
        if (currentZoomedMesh) toggleZoom(currentZoomedMesh);
        gsap.to(mesh.scale, { x: 2, y: 2, z: 2, duration: 1 });
        mesh.userData.isZoomed = true;
        currentZoomedMesh = mesh;
    }
}

// --- Animation Loop ---
const clock = new THREE.Clock();

function animate() {
    const elapsedTime = clock.getElapsedTime();

    particlesMesh.rotation.y = elapsedTime * 0.05;

    galleryMeshes.forEach(mesh => {
        if (!mesh.userData.isZoomed) {
            mesh.position.y = mesh.userData.originalY + Math.sin(elapsedTime * 2 + mesh.userData.floatOffset) * 0.5;
        }
    });

    photoGroup.rotation.y += 0.001;

    bloomPass.strength = 0.8 + Math.sin(elapsedTime) * 0.1;

    composer.render();
    requestAnimationFrame(animate);
}
animate();

// --- Interactive & Scroll Logic (GSAP) ---
gsap.registerPlugin(ScrollTrigger);

camera.position.z = 5;
camera.position.y = 0;

const tl = gsap.timeline({
    scrollTrigger: {
        trigger: "body",
        start: "top top",
        end: "bottom bottom",
        scrub: 1,
    }
});

tl.to(camera.position, { z: 15, duration: 2 })
    .to(photoGroup.position, { y: 30, duration: 10 }, "<")
    .to(photoGroup.rotation, { y: Math.PI * 4, duration: 10 }, "<");

// --- SILVER STARS Logic (Replacing Balloons) ---
function createSilverStar() {
    const star = document.createElement('div');
    star.classList.add('silver-star');

    const size = Math.random() * 30 + 40; // 40-70px
    star.style.width = `${size}px`;
    star.style.height = `${size}px`;

    const left = Math.random() * 90 + 5;
    star.style.left = `${left}vw`;

    const duration = Math.random() * 5 + 6; // 6-11s
    star.style.animationDuration = `${duration}s`;

    // SVG Star Shape
    star.innerHTML = `
        <svg viewBox="0 0 51 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M25.5 0L31.5 18H51L35.25 29L41.25 48L25.5 37L9.75 48L15.75 29L0 18H19.5L25.5 0Z" 
                  fill="url(#silverGrad)" stroke="#fff" stroke-width="1"/>
            <defs>
                <linearGradient id="silverGrad" x1="0" y1="0" x2="51" y2="48">
                    <stop offset="0%" style="stop-color:#e8e8e8;stop-opacity:1" />
                    <stop offset="50%" style="stop-color:#c0c0c0;stop-opacity:1" />
                    <stop offset="100%" style="stop-color:#a8a8a8;stop-opacity:1" />
                </linearGradient>
            </defs>
        </svg>
    `;

    star.addEventListener('click', () => {
        popStar(star);
    });

    document.body.appendChild(star);

    setTimeout(() => {
        if (star.parentNode) star.remove();
    }, duration * 1000);
}

function popStar(star) {
    star.style.transform = 'scale(1.5) rotate(180deg)';
    star.style.opacity = '0';

    const rect = star.getBoundingClientRect();
    createMiniConfetti(rect.left + rect.width / 2, rect.top + rect.height / 2, 0);

    setTimeout(() => {
        if (star.parentNode) star.remove();
    }, 300);
}

function createMiniConfetti(x, y, hue) {
    for (let i = 0; i < 15; i++) {
        const conf = document.createElement('div');
        conf.classList.add('mini-confetti');
        conf.style.left = `${x}px`;
        conf.style.top = `${y}px`;
        conf.style.backgroundColor = `hsl(${Math.random() * 60 + 30}, 100%, 70%)`; // Silver-gold tones

        const angle = Math.random() * Math.PI * 2;
        const velocity = Math.random() * 50 + 20;
        const tx = Math.cos(angle) * velocity;
        const ty = Math.sin(angle) * velocity;

        conf.style.setProperty('--tx', `${tx}px`);
        conf.style.setProperty('--ty', `${ty}px`);

        document.body.appendChild(conf);

        setTimeout(() => conf.remove(), 1000);
    }
}

// Spawn stars periodically (after curtain opens)
let starInterval;

// --- Custom Cursor Logic ---
const cursor = document.createElement('div');
cursor.classList.add('custom-cursor');
document.body.appendChild(cursor);

const trails = [];

document.addEventListener('mousemove', (e) => {
    cursor.style.left = `${e.clientX}px`;
    cursor.style.top = `${e.clientY}px`;

    const trail = document.createElement('div');
    trail.classList.add('cursor-trail');
    trail.style.left = `${e.clientX}px`;
    trail.style.top = `${e.clientY}px`;
    document.body.appendChild(trail);
    trails.push(trail);

    if (trails.length > 20) {
        document.body.removeChild(trails.shift());
    }

    setTimeout(() => {
        if (trail.parentNode) {
            trail.style.opacity = 0;
            setTimeout(() => trail.remove(), 200);
        }
    }, 100);
});

// --- GRAND OPENING SEQUENCE ---
const openingCurtain = document.getElementById('opening-curtain');
const enterBtn = document.getElementById('enter-btn');
const audio = document.getElementById('bg-music');
const musicBtn = document.getElementById('music-btn');

// Opening Countdown
const countdownDate = new Date("Feb 15, 2026 00:00:00").getTime();

function updateOpeningCountdown() {
    const now = new Date().getTime();
    const distance = countdownDate - now;

    if (distance < 0) {
        document.getElementById("opening-countdown").innerHTML = "<p style='font-size:1.5rem; color:#ffb703;'>🎂 It's TODAY! 🎂</p>";
        enterBtn.textContent = "🎊 START THE PARTY! 🎊";
        return;
    }

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    if (document.getElementById("open-days")) {
        document.getElementById("open-days").innerText = String(days).padStart(2, '0');
        document.getElementById("open-hours").innerText = String(hours).padStart(2, '0');
        document.getElementById("open-minutes").innerText = String(minutes).padStart(2, '0');
        document.getElementById("open-seconds").innerText = String(seconds).padStart(2, '0');
    }
}

setInterval(updateOpeningCountdown, 1000);
updateOpeningCountdown();

// Enter Button Click
enterBtn.addEventListener('click', () => {
    // Open Curtain
    openingCurtain.classList.add('open');

    // Start Music
    audio.play().catch(e => console.log("Audio autoplay blocked:", e));
    musicBtn.textContent = "⏸ Pause";

    // Camera Entrance Animation
    gsap.to(camera.position, {
        z: 3,
        duration: 3,
        ease: "power2.out"
    });

    // Start Silver Stars
    starInterval = setInterval(createSilverStar, 1000);

    // Remove curtain after animation
    setTimeout(() => {
        openingCurtain.style.display = 'none';
    }, 3000);
});

// --- Hero Countdown (In-Page) ---
function updateCountdown() {
    const now = new Date().getTime();
    const distance = countdownDate - now;

    if (distance < 0) {
        if (document.getElementById("countdown-container"))
            document.getElementById("countdown-container").innerHTML = "<h3>It's Today! Happy Birthday! 🎂</h3>";
        return;
    }
    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    if (document.getElementById("days")) {
        document.getElementById("days").innerText = String(days).padStart(2, '0');
        document.getElementById("hours").innerText = String(hours).padStart(2, '0');
        document.getElementById("minutes").innerText = String(minutes).padStart(2, '0');
        document.getElementById("seconds").innerText = String(seconds).padStart(2, '0');
    }
}
setInterval(updateCountdown, 1000);
updateCountdown();

// --- Wish Button ---
document.getElementById('wish-btn').addEventListener('click', () => {
    for (let i = 0; i < 20; i++) {
        setTimeout(() => createFireworks(), i * 200);
    }
    const btn = document.getElementById('wish-btn');
    btn.textContent = "Wishes Sent! ✨";
    btn.style.backgroundColor = "#ffb703";
});

function createFireworks() {
    const geometry = new THREE.BufferGeometry();
    const count = 1500;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);

    const x = (Math.random() - 0.5) * 20;
    const y = (Math.random() - 0.5) * 15 + 5;
    const z = (Math.random() - 0.5) * 10 - 5;

    for (let i = 0; i < count; i++) {
        positions[i * 3] = x + (Math.random() - 0.5);
        positions[i * 3 + 1] = y + (Math.random() - 0.5);
        positions[i * 3 + 2] = z + (Math.random() - 0.5);

        colors[i * 3] = Math.random();
        colors[i * 3 + 1] = Math.random();
        colors[i * 3 + 2] = Math.random();
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({ size: 0.2, vertexColors: true, transparent: true, blending: THREE.AdditiveBlending });
    const explosion = new THREE.Points(geometry, material);
    scene.add(explosion);

    gsap.to(material, { opacity: 0, duration: 2.5 });
    gsap.to(explosion.scale, {
        x: 12, y: 12, z: 12,
        duration: 2.5,
        ease: "power2.out",
        onComplete: () => scene.remove(explosion)
    });
}

// --- Music Control ---
let isPlaying = false;

musicBtn.addEventListener('click', () => {
    if (!isPlaying) {
        audio.play().catch(e => console.log("Audio play failed", e));
        musicBtn.textContent = "⏸ Pause";
        isPlaying = true;
    } else {
        audio.pause();
        musicBtn.textContent = "🎵 Music";
        isPlaying = false;
    }
});

// --- Resize Handler ---
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    bloomPass.setSize(window.innerWidth, window.innerHeight);
    composer.setSize(window.innerWidth, window.innerHeight);
});
