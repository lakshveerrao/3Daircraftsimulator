// Three.js 3D Plane Simulator
class PlaneSimulator {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.plane = null;
        this.terrain = null;
        this.clouds = [];
        this.controls = {
            speed: 0,
            altitude: 0,
            pitch: 0,
            roll: 0,
            yaw: 0
        };
        this.keys = {};
        this.mouse = { x: 0, y: 0 };
        this.autoPilot = false;
        this.clock = new THREE.Clock();
        
        this.init();
        this.setupEventListeners();
        this.animate();
    }

    init() {
        // Scene setup
        this.scene = new THREE.Scene();
        this.scene.fog = new THREE.Fog(0x87CEEB, 1000, 20000);

        // Camera setup
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 50000);
        this.camera.position.set(0, 100, 0);

        // Renderer setup
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setClearColor(0x87CEEB);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        document.getElementById('scene-container').appendChild(this.renderer.domElement);

        // Lighting
        this.setupLighting();

        // Create plane
        this.createPlane();

        // Create terrain
        this.createTerrain();

        // Create sky
        this.createSky();

        // Create clouds
        this.createClouds();

        // Setup controls
        this.setupControls();
    }

    setupLighting() {
        // Ambient light
        const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
        this.scene.add(ambientLight);

        // Directional light (sun)
        const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        directionalLight.position.set(1000, 1000, 500);
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        directionalLight.shadow.camera.near = 0.5;
        directionalLight.shadow.camera.far = 5000;
        directionalLight.shadow.camera.left = -1000;
        directionalLight.shadow.camera.right = 1000;
        directionalLight.shadow.camera.top = 1000;
        directionalLight.shadow.camera.bottom = -1000;
        this.scene.add(directionalLight);
    }

    createPlane() {
        const planeGroup = new THREE.Group();

        // Fuselage
        const fuselageGeometry = new THREE.CylinderGeometry(2, 2, 20, 8);
        const fuselageMaterial = new THREE.MeshLambertMaterial({ color: 0xffffff });
        const fuselage = new THREE.Mesh(fuselageGeometry, fuselageMaterial);
        fuselage.rotation.z = Math.PI / 2;
        planeGroup.add(fuselage);

        // Wings
        const wingGeometry = new THREE.BoxGeometry(30, 1, 8);
        const wingMaterial = new THREE.MeshLambertMaterial({ color: 0xcccccc });
        const wings = new THREE.Mesh(wingGeometry, wingMaterial);
        wings.position.y = 0;
        planeGroup.add(wings);

        // Tail
        const tailGeometry = new THREE.BoxGeometry(4, 6, 1);
        const tailMaterial = new THREE.MeshLambertMaterial({ color: 0xcccccc });
        const tail = new THREE.Mesh(tailGeometry, tailMaterial);
        tail.position.set(8, 3, 0);
        planeGroup.add(tail);

        // Horizontal stabilizer
        const stabilizerGeometry = new THREE.BoxGeometry(8, 1, 3);
        const stabilizerMaterial = new THREE.MeshLambertMaterial({ color: 0xcccccc });
        const stabilizer = new THREE.Mesh(stabilizerGeometry, stabilizerMaterial);
        stabilizer.position.set(8, 0, 0);
        planeGroup.add(stabilizer);

        // Propeller
        const propellerGeometry = new THREE.BoxGeometry(0.2, 0.2, 6);
        const propellerMaterial = new THREE.MeshLambertMaterial({ color: 0x333333 });
        const propeller = new THREE.Mesh(propellerGeometry, propellerMaterial);
        propeller.position.set(-10, 0, 0);
        planeGroup.add(propeller);

        // Landing gear
        const gearGeometry = new THREE.CylinderGeometry(0.5, 0.5, 3);
        const gearMaterial = new THREE.MeshLambertMaterial({ color: 0x333333 });
        
        const frontGear = new THREE.Mesh(gearGeometry, gearMaterial);
        frontGear.position.set(-5, -1.5, 0);
        planeGroup.add(frontGear);

        const leftGear = new THREE.Mesh(gearGeometry, gearMaterial);
        leftGear.position.set(0, -1.5, 4);
        planeGroup.add(leftGear);

        const rightGear = new THREE.Mesh(gearGeometry, gearMaterial);
        rightGear.position.set(0, -1.5, -4);
        planeGroup.add(rightGear);

        this.plane = planeGroup;
        this.plane.position.set(0, 100, 0);
        this.scene.add(this.plane);
    }

    createTerrain() {
        const terrainGeometry = new THREE.PlaneGeometry(50000, 50000, 100, 100);
        const terrainMaterial = new THREE.MeshLambertMaterial({ 
            color: 0x228B22,
            side: THREE.DoubleSide 
        });
        
        this.terrain = new THREE.Mesh(terrainGeometry, terrainMaterial);
        this.terrain.rotation.x = -Math.PI / 2;
        this.terrain.position.y = -100;
        this.terrain.receiveShadow = true;
        this.scene.add(this.terrain);

        // Add some mountains
        for (let i = 0; i < 20; i++) {
            const mountainGeometry = new THREE.ConeGeometry(
                Math.random() * 500 + 200,
                Math.random() * 1000 + 500,
                8
            );
            const mountainMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
            const mountain = new THREE.Mesh(mountainGeometry, mountainMaterial);
            
            mountain.position.set(
                (Math.random() - 0.5) * 40000,
                Math.random() * 500 + 200,
                (Math.random() - 0.5) * 40000
            );
            mountain.castShadow = true;
            mountain.receiveShadow = true;
            this.scene.add(mountain);
        }
    }

    createSky() {
        const skyGeometry = new THREE.SphereGeometry(20000, 32, 32);
        const skyMaterial = new THREE.MeshBasicMaterial({
            color: 0x87CEEB,
            side: THREE.BackSide
        });
        const sky = new THREE.Mesh(skyGeometry, skyMaterial);
        this.scene.add(sky);
    }

    createClouds() {
        for (let i = 0; i < 50; i++) {
            const cloudGroup = new THREE.Group();
            
            for (let j = 0; j < 5; j++) {
                const cloudGeometry = new THREE.SphereGeometry(
                    Math.random() * 100 + 50,
                    8,
                    6
                );
                const cloudMaterial = new THREE.MeshLambertMaterial({ 
                    color: 0xffffff,
                    transparent: true,
                    opacity: 0.8
                });
                const cloud = new THREE.Mesh(cloudGeometry, cloudMaterial);
                
                cloud.position.set(
                    (Math.random() - 0.5) * 200,
                    (Math.random() - 0.5) * 50,
                    (Math.random() - 0.5) * 200
                );
                cloudGroup.add(cloud);
            }
            
            cloudGroup.position.set(
                (Math.random() - 0.5) * 40000,
                Math.random() * 3000 + 1000,
                (Math.random() - 0.5) * 40000
            );
            
            this.clouds.push(cloudGroup);
            this.scene.add(cloudGroup);
        }
    }

    setupControls() {
        // Speed control
        document.getElementById('speedSlider').addEventListener('input', (e) => {
            this.controls.speed = parseFloat(e.target.value);
            document.getElementById('speed').textContent = this.controls.speed;
        });

        // Altitude control
        document.getElementById('altitudeSlider').addEventListener('input', (e) => {
            this.controls.altitude = parseFloat(e.target.value);
            document.getElementById('altitude').textContent = this.controls.altitude;
        });

        // Pitch control
        document.getElementById('pitchSlider').addEventListener('input', (e) => {
            this.controls.pitch = parseFloat(e.target.value);
            document.getElementById('pitch').textContent = this.controls.pitch;
        });

        // Roll control
        document.getElementById('rollSlider').addEventListener('input', (e) => {
            this.controls.roll = parseFloat(e.target.value);
            document.getElementById('roll').textContent = this.controls.roll;
        });

        // Yaw control
        document.getElementById('yawSlider').addEventListener('input', (e) => {
            this.controls.yaw = parseFloat(e.target.value);
            document.getElementById('yaw').textContent = this.controls.yaw;
        });
    }

    setupEventListeners() {
        // Keyboard controls
        document.addEventListener('keydown', (e) => {
            this.keys[e.code] = true;
            
            if (e.code === 'Space') {
                e.preventDefault();
                this.autoPilot = !this.autoPilot;
            }
            
            if (e.code === 'KeyR') {
                this.resetPosition();
            }
        });

        document.addEventListener('keyup', (e) => {
            this.keys[e.code] = false;
        });

        // Mouse controls
        document.addEventListener('mousemove', (e) => {
            this.mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
            this.mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
        });

        // Window resize
        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        });
    }

    resetPosition() {
        this.plane.position.set(0, 100, 0);
        this.plane.rotation.set(0, 0, 0);
        this.camera.position.set(0, 100, 0);
        this.camera.lookAt(this.plane.position);
        
        // Reset controls
        this.controls = {
            speed: 0,
            altitude: 100,
            pitch: 0,
            roll: 0,
            yaw: 0
        };
        
        // Update UI
        document.getElementById('speedSlider').value = 0;
        document.getElementById('altitudeSlider').value = 100;
        document.getElementById('pitchSlider').value = 0;
        document.getElementById('rollSlider').value = 0;
        document.getElementById('yawSlider').value = 0;
        
        document.getElementById('speed').textContent = '0';
        document.getElementById('altitude').textContent = '100';
        document.getElementById('pitch').textContent = '0';
        document.getElementById('roll').textContent = '0';
        document.getElementById('yaw').textContent = '0';
    }

    updatePlane() {
        const delta = this.clock.getDelta();
        
        // Auto-pilot mode
        if (this.autoPilot) {
            this.controls.speed = Math.min(this.controls.speed + 10 * delta, 400);
            this.controls.altitude = Math.min(this.controls.altitude + 50 * delta, 5000);
            this.controls.pitch = Math.sin(Date.now() * 0.001) * 5;
            this.controls.roll = Math.sin(Date.now() * 0.002) * 10;
            this.controls.yaw += 10 * delta;
            
            // Update UI
            document.getElementById('speedSlider').value = this.controls.speed;
            document.getElementById('altitudeSlider').value = this.controls.altitude;
            document.getElementById('pitchSlider').value = this.controls.pitch;
            document.getElementById('rollSlider').value = this.controls.roll;
            document.getElementById('yawSlider').value = this.controls.yaw;
            
            document.getElementById('speed').textContent = Math.round(this.controls.speed);
            document.getElementById('altitude').textContent = Math.round(this.controls.altitude);
            document.getElementById('pitch').textContent = Math.round(this.controls.pitch);
            document.getElementById('roll').textContent = Math.round(this.controls.roll);
            document.getElementById('yaw').textContent = Math.round(this.controls.yaw);
        }

        // Manual controls
        if (this.keys['KeyW']) this.controls.pitch += 30 * delta;
        if (this.keys['KeyS']) this.controls.pitch -= 30 * delta;
        if (this.keys['KeyA']) this.controls.roll -= 30 * delta;
        if (this.keys['KeyD']) this.controls.roll += 30 * delta;

        // Apply controls to plane
        this.plane.rotation.x = THREE.MathUtils.degToRad(this.controls.pitch);
        this.plane.rotation.z = THREE.MathUtils.degToRad(this.controls.roll);
        this.plane.rotation.y = THREE.MathUtils.degToRad(this.controls.yaw);

        // Move plane forward
        const speed = this.controls.speed / 3.6; // Convert km/h to m/s
        const direction = new THREE.Vector3(0, 0, -1);
        direction.applyQuaternion(this.plane.quaternion);
        this.plane.position.add(direction.multiplyScalar(speed * delta));

        // Update altitude
        this.plane.position.y = this.controls.altitude;

        // Update camera
        this.updateCamera();
    }

    updateCamera() {
        // Camera follows plane with offset
        const offset = new THREE.Vector3(0, 20, 50);
        offset.applyQuaternion(this.plane.quaternion);
        this.camera.position.copy(this.plane.position).add(offset);
        this.camera.lookAt(this.plane.position);
    }

    animate() {
        requestAnimationFrame(() => this.animate());
        
        this.updatePlane();
        this.renderer.render(this.scene, this.camera);
    }
}

// Initialize the simulator when the page loads
window.addEventListener('load', () => {
    new PlaneSimulator();
});
