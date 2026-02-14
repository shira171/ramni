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

const LETTER_TEXT = `My Dearest Ramni,

Happy Birthday! 🎉

I wanted to make this day as special as you are to me. You are the light of my life, my best friend, and my greatest adventure.

Every moment with you is a treasure, and I can't wait to create a million more memories together.

May this year bring you all the joy, love, and success you deserve.

I love you so much! ❤️

- Your [Name]`;

// --- Scene Setup ---
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
document.getElementById('canvas-container').appendChild(renderer.domElement);

// --- Post Processing ---
const renderScene = new THREE.RenderPass(scene, camera);
const bloomPass = new THREE.UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 1.5, 0.4, 0.85);

bloomPass.threshold = 0.6;
bloomPass.strength = 0.35;
bloomPass.radius = 0.2;

const composer = new THREE.EffectComposer(renderer);
composer.addPass(renderScene);
composer.addPass(bloomPass);

// Fog
scene.fog = new THREE.FogExp2(0x050510, 0.015);

// --- Lighting ---
const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
scene.add(ambientLight);

const dirLight = new THREE.DirectionalLight(0xffffff, 1);
dirLight.position.set(5, 10, 7);
dirLight.castShadow = true;
scene.add(dirLight);

// --- Logic State ---
let storyState = 'BOOK'; // 'BOOK', 'HEART_GALLERY', 'CAKE', 'LETTER', 'FINALE'
const instructionEl = document.getElementById('instruction');
const cutBtn = document.getElementById('cut-cake-btn');

function showInstruction(text, duration = 3000) {
    if (!instructionEl) return;
    instructionEl.textContent = text;
    instructionEl.style.opacity = 1;
    if (duration > 0) {
        setTimeout(() => { instructionEl.style.opacity = 0; }, duration);
    }
}

// ==========================================
// 1. COUNTDOWN LOGIC
// ==========================================
function updateCountdown() {
    const currentYear = new Date().getFullYear();
    const targetDate = new Date(`Feb 15, ${currentYear} 00:00:00`).getTime();
    const now = new Date().getTime();
    let distance = targetDate - now;

    if (distance < 0) {
        distance = new Date(`Feb 15, ${currentYear + 1} 00:00:00`).getTime() - now;
    }

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    if (document.getElementById('days')) document.getElementById('days').innerText = String(days).padStart(2, '0');
    if (document.getElementById('hours')) document.getElementById('hours').innerText = String(hours).padStart(2, '0');
    if (document.getElementById('minutes')) document.getElementById('minutes').innerText = String(minutes).padStart(2, '0');
    if (document.getElementById('seconds')) document.getElementById('seconds').innerText = String(seconds).padStart(2, '0');
}
setInterval(updateCountdown, 1000);
updateCountdown();


// ==========================================
// 2. PRO STARFIELD
// ==========================================
function createStarfield() {
    const geometry = new THREE.BufferGeometry();
    const count = 6000;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
        const r = Math.random() * 100;
        const theta = 2 * Math.PI * Math.random();
        const phi = Math.acos(2 * Math.random() - 1);

        positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
        positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
        positions[i * 3 + 2] = r * Math.cos(phi);

        colors[i * 3] = 0.8;
        colors[i * 3 + 1] = 0.8;
        colors[i * 3 + 2] = 1;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({ size: 0.15, vertexColors: true, transparent: true, opacity: 0.8 });
    const stars = new THREE.Points(geometry, material);
    scene.add(stars);
    return stars;
}
const starField = createStarfield();


// ==========================================
// 3. PRO BOOK PHASE & HEART GALLERY
// ==========================================
const bookGroup = new THREE.Group();
scene.add(bookGroup);
let bookPages = [];
let currentBookPage = 0;
let heartParticlesObj = null;

function createProBook() {
    const coverGeo = new THREE.BoxGeometry(6, 8, 0.5);
    const coverMat = new THREE.MeshStandardMaterial({
        color: 0x3a0ca3,
        metalness: 0.6,
        roughness: 0.2
    });
    const cover = new THREE.Mesh(coverGeo, coverMat);
    bookGroup.add(cover);

    const spineLight = new THREE.PointLight(0x4cc9f0, 2, 10);
    spineLight.position.z = 1;
    bookGroup.add(spineLight);

    const textureLoader = new THREE.TextureLoader();
    const bookImages = images.slice(0, 15);

    bookImages.forEach((img, i) => {
        textureLoader.load(img, (tex) => {
            const pageGeo = new THREE.PlaneGeometry(5.5, 7.5);
            const pageMat = new THREE.MeshBasicMaterial({
                map: tex,
                side: THREE.DoubleSide
            });
            const page = new THREE.Mesh(pageGeo, pageMat);
            page.position.z = 0.3 + (i * 0.02);
            page.visible = false;

            bookGroup.add(page);
            bookPages.push(page);

            if (i === 0) page.visible = true;
        });
    });

    bookGroup.rotation.y = -Math.PI / 6;
    bookGroup.position.set(0, 0, 0);

    gsap.to(bookGroup.position, { y: 0.5, duration: 2, yoyo: true, repeat: -1, ease: "sine.inOut" });

    showInstruction("Tap the Book to Release Memories 📖", 0);
}
createProBook();

function nextBookPage() {
    // RELEASE ALL PAGES INTO HEART SHAPE
    showInstruction("Forming a Heart of Memories... ❤️");
    storyState = 'HEART_GALLERY';

    // Animate book opening/vanishing
    gsap.to(bookGroup.rotation, { y: Math.PI * 2, duration: 1.5 });
    gsap.to(bookGroup.scale, { x: 0, y: 0, z: 0, duration: 1, delay: 1 }); // Shrink book

    // 1. Particle Heart (Visual Backup)
    createParticleHeart();

    // 2. Image Heart
    if (bookPages.length === 0) {
        showInstruction("Loading Memories... Please Wait ⏳", 2000);
        return;
    }

    bookPages.forEach((page, i) => {
        page.visible = true;
        // Reset scale just in case
        page.scale.set(0, 0, 0);

        // Detach from book group to scene to ensure world positioning
        scene.attach(page);

        // Heart Formula
        const t = (i / bookPages.length) * Math.PI * 2;
        const x = 16 * Math.pow(Math.sin(t), 3);
        const y = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t);
        const z = (Math.random() - 0.5) * 4; // More depth

        // Scale UP to fill screen
        const scaleFactor = 0.8;

        gsap.to(page.position, {
            x: x * scaleFactor,
            y: y * scaleFactor,
            z: z,
            duration: 3.5,
            ease: "elastic.out(1, 0.4)",
            delay: i * 0.05
        });

        gsap.to(page.scale, { x: 1.5, y: 1.5, z: 1.5, duration: 1, delay: i * 0.05 });
        // Face camera
        gsap.to(page.rotation, { x: 0, y: 0, z: 0, duration: 2 });
    });

    // Instructions for next step
    setTimeout(() => {
        showInstruction("Click Anywhere to Start the Party! 🎉", 0);
    }, 4500);
}

function createParticleHeart() {
    const geometry = new THREE.BufferGeometry();
    const count = 3000; // More particles
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
        const t = Math.random() * Math.PI * 2;
        // Randomize slightly for volume
        const r = 0.8; // Match image scale
        const x = r * 16 * Math.pow(Math.sin(t), 3);
        const y = r * (13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));
        const z = (Math.random() - 0.5) * 6;

        positions[i * 3] = x + (Math.random() - 0.5) * 0.5; // scatter
        positions[i * 3 + 1] = y + (Math.random() - 0.5) * 0.5;
        positions[i * 3 + 2] = z;

        colors[i * 3] = 1; // Red
        colors[i * 3 + 1] = 0.1; // Deep Red
        colors[i * 3 + 2] = 0.3;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({ size: 0.15, vertexColors: true, blending: THREE.AdditiveBlending });
    heartParticlesObj = new THREE.Points(geometry, material);
    scene.add(heartParticlesObj);

    // Heart Beat Animation
    gsap.to(heartParticlesObj.scale, { x: 1.1, y: 1.1, z: 1.1, duration: 1.2, yoyo: true, repeat: -1, ease: "sine.inOut" });

    // NO AUTO CLEANUP - Stays until interaction
}

function finishGalleryPhase() {
    gsap.to(camera.position, { z: 30, duration: 2 }); // Pull back further

    // Remove particles manually now
    if (heartParticlesObj) {
        gsap.to(heartParticlesObj.material, { opacity: 0, duration: 1, onComplete: () => scene.remove(heartParticlesObj) });
    }

    // Fly away pages
    bookPages.forEach((page, i) => {
        gsap.to(page.position, {
            y: 50,
            x: (Math.random() - 0.5) * 100,
            duration: 1.5,
            delay: i * 0.05,
            ease: "power2.in",
            onComplete: () => scene.remove(page)
        });
    });

    setTimeout(startCakePhase, 2000);
}


// ==========================================
// 4. CELEBRATION PHASE (CUTTING CAKE)
// ==========================================
const cakeGroup = new THREE.Group();
const sliceGroups = []; // To store slices for cutting
let candles = [];

function createCake() {
    // Premium Colors: Velvet Red, Gold, Cream
    const cakeColors = [0x8a1c1c, 0xffd700, 0xfffdd0];

    // Split cylinders into wedges? 
    // Simplified: Use 4 wedges per layer to simulate "cuttable" cake

    for (let l = 0; l < 3; l++) {
        // BIGGER CAKE
        const radius = 4 - (l * 0.8); // 4 -> 3.2 -> 2.4
        const height = 1.5;
        const color = cakeColors[l];

        const layerGroup = new THREE.Group();
        layerGroup.position.y = (l * height) + height / 2;

        // 4 Slices
        for (let s = 0; s < 4; s++) {
            const wedgeGeo = new THREE.CylinderGeometry(radius, radius, height, 32, 1, false, s * (Math.PI / 2), Math.PI / 2);
            // Metalness/Roughness for Gold vs others
            const isGold = (l === 1);
            const wedgeMat = new THREE.MeshStandardMaterial({
                color: color,
                roughness: isGold ? 0.3 : 0.8,
                metalness: isGold ? 0.8 : 0.1,
                side: THREE.DoubleSide
            });
            const wedge = new THREE.Mesh(wedgeGeo, wedgeMat);

            wedge.userData = {
                angle: s * (Math.PI / 2) + Math.PI / 4,
                radius: radius,
                initialPos: wedge.position.clone()
            };

            layerGroup.add(wedge);
            sliceGroups.push(wedge); // Track all wedges
        }
        cakeGroup.add(layerGroup);
    }

    // Candles on top
    const candleCount = 12; // More candles
    const topLayerY = 4.5;

    for (let i = 0; i < candleCount; i++) {
        const angle = (i / candleCount) * Math.PI * 2;
        const radius = 1.8;

        const candleGeo = new THREE.CylinderGeometry(0.1, 0.1, 0.8, 8);
        const candleMat = new THREE.MeshStandardMaterial({ color: 0xffffff });
        const candle = new THREE.Mesh(candleGeo, candleMat);

        candle.position.set(Math.cos(angle) * radius, topLayerY + 0.4, Math.sin(angle) * radius);

        const flameGeo = new THREE.SphereGeometry(0.15, 8, 8);
        const flameMat = new THREE.MeshBasicMaterial({ color: 0xffa500 });
        const flame = new THREE.Mesh(flameGeo, flameMat);
        flame.position.y = 0.5;

        const light = new THREE.PointLight(0xffa500, 1.5, 5);
        light.position.y = 0.5;

        const candleGroup = new THREE.Group();
        candleGroup.add(candle);
        candleGroup.add(flame);
        candleGroup.add(light);
        candleGroup.position.copy(candle.position);
        candle.position.set(0, 0, 0);

        candleGroup.userData = { type: 'candle', flame, light, active: true };
        cakeGroup.add(candleGroup);
        candles.push(candleGroup);
    }
}
createCake();

function startCakePhase() {
    storyState = 'CAKE';
    scene.add(cakeGroup);
    cakeGroup.position.set(0, -15, 0);

    // Slower, majestic rise
    gsap.to(cakeGroup.position, { y: -2.5, duration: 4, ease: "power3.out" });

    const music = document.getElementById('bg-music');
    if (music) music.play().catch(e => console.log('Music autoplay blocked'));

    // Show CUT BUTTON
    setTimeout(() => {
        showInstruction("Time to Cut the Grand Cake! 🔪", 0);
        cutBtn.style.display = 'block';
    }, 4000);
}

// Button Interaction
cutBtn.addEventListener('click', () => {
    cutBtn.style.display = 'none';
    cutTheCake();
});

function cutTheCake() {
    showInstruction("Yay! Happy Birthday! 🎉");

    // Realistic Slicing: Separate + Tip Over
    sliceGroups.forEach(wedge => {
        const dist = 1.5; // Farther separation
        const angle = wedge.userData.angle;

        // Move OUT
        gsap.to(wedge.position, {
            x: Math.cos(angle) * dist,
            z: Math.sin(angle) * dist,
            duration: 3,
            ease: "power2.out"
        });

        // Rotate "fall" effect
        gsap.to(wedge.rotation, {
            x: (Math.random() - 0.5) * 0.2,
            z: (Math.random() - 0.5) * 0.2,
            duration: 3
        });
    });

    // Massive Fireworks
    for (let i = 0; i < 15; i++) {
        setTimeout(() => createFireworks(new THREE.Vector3((Math.random() - 0.5) * 10, 5 + Math.random() * 5, (Math.random() - 0.5) * 10)), i * 200);
    }

    // Candles blow out automagically
    candles.forEach(c => blowCandle(c));

    // Transition to letter
    setTimeout(startLetterPhase, 6000);
}

function blowCandle(candleGroup) {
    if (!candleGroup.userData.active) return;
    candleGroup.userData.active = false;

    gsap.to(candleGroup.userData.flame.scale, { x: 0, y: 0, z: 0, duration: 0.2 });
    gsap.to(candleGroup.userData.light, { intensity: 0, duration: 0.2 });
}


// ==========================================
// 5. LETTER & FINALE
// ==========================================
function startLetterPhase() {
    storyState = 'LETTER';

    gsap.to(cakeGroup.position, { y: -10, duration: 1 });

    const modal = document.getElementById('letter-modal');
    const content = document.getElementById('letter-content');

    setTimeout(() => {
        modal.classList.add('active');
        typeWriter(content, LETTER_TEXT, 0);
    }, 1500);
}

function typeWriter(element, text, i) {
    if (i < text.length) {
        element.innerHTML += text.charAt(i);
        setTimeout(() => typeWriter(element, text, i + 1), 50);
    }
}

document.getElementById('close-letter-btn').addEventListener('click', () => {
    document.getElementById('letter-modal').classList.remove('active');
    startFinalePhase();
});

function startFinalePhase() {
    storyState = 'FINALE';

    const hero = document.getElementById('hero');
    if (hero) hero.style.opacity = 1;

    setInterval(() => {
        createFireworks(
            new THREE.Vector3(
                (Math.random() - 0.5) * 30,
                (Math.random() - 0.5) * 20 + 5,
                (Math.random() - 0.5) * 20
            )
        );
    }, 300);

    showInstruction("HAPPY BIRTHDAY RAMNI! ❤️", 0);
}

function createFireworks(pos = new THREE.Vector3()) {
    const geometry = new THREE.BufferGeometry();
    const count = 500;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);

    const rx = pos.x;
    const ry = pos.y;
    const rz = pos.z;

    for (let i = 0; i < count; i++) {
        positions[i * 3] = rx;
        positions[i * 3 + 1] = ry;
        positions[i * 3 + 2] = rz;

        colors[i * 3] = Math.random();
        colors[i * 3 + 1] = Math.random();
        colors[i * 3 + 2] = Math.random();
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({ size: 0.1, vertexColors: true, blending: THREE.AdditiveBlending });
    const particles = new THREE.Points(geometry, material);
    scene.add(particles);

    const velocities = [];
    for (let i = 0; i < count; i++) {
        velocities.push({
            x: (Math.random() - 0.5) * 0.8,
            y: (Math.random() - 0.5) * 0.8,
            z: (Math.random() - 0.5) * 0.8
        });
    }

    let life = 1.0;

    function animateFirework() {
        life -= 0.015;
        if (life <= 0) {
            scene.remove(particles);
            return;
        }

        const posAttr = particles.geometry.attributes.position.array;
        for (let i = 0; i < count; i++) {
            posAttr[i * 3] += velocities[i].x;
            posAttr[i * 3 + 1] += velocities[i].y;
            posAttr[i * 3 + 2] += velocities[i].z;
            velocities[i].y -= 0.01;
        }
        particles.geometry.attributes.position.needsUpdate = true;
        material.opacity = life;
        requestAnimationFrame(animateFirework);
    }
    animateFirework();
}


// ==========================================
// INPUT LOOP
// ==========================================
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

window.addEventListener('click', (event) => {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    if (storyState === 'BOOK') {
        nextBookPage();
    } else if (storyState === 'HEART_GALLERY') {
        finishGalleryPhase();
    } else if (storyState === 'CAKE') {
        // Optional tap interaction for cake if needed
    }
});

window.addEventListener('mousemove', (e) => {
    const mx = (e.clientX / window.innerWidth) * 2 - 1;
    const my = -(e.clientY / window.innerHeight) * 2 + 1;
    starField.rotation.x = my * 0.1;
    starField.rotation.y = mx * 0.1;
});

function animate() {
    requestAnimationFrame(animate);

    if (storyState === 'BOOK') {
        bookGroup.rotation.y += 0.002;
    }
    if (storyState === 'CAKE') {
        cakeGroup.rotation.y += 0.003;
    }

    // Heart Gallery Float
    if (storyState === 'HEART_GALLERY') {
        bookPages.forEach((page, i) => {
            page.rotation.y += 0.005;
        });
    }

    composer.render();
}
camera.position.z = 12;
animate();

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    bloomPass.setSize(window.innerWidth, window.innerHeight);
    composer.setSize(window.innerWidth, window.innerHeight);
});
