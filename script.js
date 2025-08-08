// Fast 3D Aircraft Simulator - 9 Second Load
class FastFlightSimulator {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.plane = null;
        this.terrain = null;
        this.clouds = [];
        this.buildings = [];
        this.trees = [];
        
        // Aircraft types
        this.aircraftTypes = {
            cessna: { name: 'Cessna 172', maxSpeed: 126, maxAltitude: 14000 },
            boeing: { name: 'Boeing 737', maxSpeed: 450, maxAltitude: 41000 },
            helicopter: { name: 'Bell 206', maxSpeed: 140, maxAltitude: 13000 },
            fighter: { name: 'F-16 Fighter', maxSpeed: 1500, maxAltitude: 50000 }
        };
        
        this.selectedAircraft = 'cessna';
        this.aircraftData = this.aircraftTypes.cessna;
        
        // Flight data
        this.flightData = {
            speed: 0,
            altitude: 100,
            heading: 0,
            pitch: 0,
            roll: 0,
            throttle: 0,
            fuel: 100
        };
        
        // Systems
        this.systems = {
            engineRunning: false,
            landingGear: true,
            flaps: false
        };
        
        // Performance tracking
        this.frameCount = 0;
        this.lastTime = performance.now();
        this.fps = 60;
        this.startTime = Date.now();
        this.loadStartTime = performance.now();
        
        // Clock for animations
        this.clock = new THREE.Clock();
        
        // Initialize
        this.init();
    }

    async init() {
        // Start loading timer
        this.loadStartTime = performance.now();
        this.updateLoadingProgress(10, 'Initializing scene...');
        
        // Scene setup
        this.scene = new THREE.Scene();
        this.scene.fog = new THREE.Fog(0x87CEEB, 1000, 15000);
        
        this.updateLoadingProgress(20, 'Setting up camera...');
        
        // Camera setup
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 30000);
        this.camera.position.set(0, 100, 0);
        
        this.updateLoadingProgress(30, 'Configuring renderer...');
        
        // Renderer setup with maximum performance
        this.renderer = new THREE.WebGLRenderer({ 
            antialias: false,
            powerPreference: "high-performance",
            alpha: false
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setClearColor(0x87CEEB);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.BasicShadowMap;
        document.getElementById('scene-container').appendChild(this.renderer.domElement);
        
        this.updateLoadingProgress(40, 'Setting up lighting...');
        
        // Simple lighting
        const ambientLight = new THREE.AmbientLight(0x404040, 0.8);
        this.scene.add(ambientLight);
        
        const directionalLight = new THREE.DirectionalLight(0xffffff, 1.0);
        directionalLight.position.set(1000, 1000, 500);
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 1024;
        directionalLight.shadow.mapSize.height = 1024;
        this.scene.add(directionalLight);
        
        this.updateLoadingProgress(50, 'Creating terrain...');
        
        // Create minimal terrain
        this.createMinimalTerrain();
        
        this.updateLoadingProgress(60, 'Adding environment...');
        
        // Create minimal environment
        this.createMinimalEnvironment();
        
        this.updateLoadingProgress(70, 'Creating aircraft...');
        
        // Create aircraft
        this.createAircraft();
        
        this.updateLoadingProgress(80, 'Setting up controls...');
        
        // Setup controls
        this.setupControls();
        
        this.updateLoadingProgress(90, 'Initializing HUD...');
        
        // Initialize HUD
        this.initHUD();
        
        this.updateLoadingProgress(95, 'Starting simulation...');
        
        // Start animation
        this.animate();
        
        // Hide loading screen after 9 seconds max
        setTimeout(() => {
            this.hideLoadingScreen();
        }, 9000);
    }

    updateLoadingProgress(progress, text) {
        const progressBar = document.getElementById('loading-progress');
        const loadingText = document.getElementById('loading-text');
        const loadingTime = document.getElementById('loading-time');
        
        if (progressBar) progressBar.style.width = progress + '%';
        if (loadingText) loadingText.textContent = text;
        if (loadingTime) {
            const elapsed = ((performance.now() - this.loadStartTime) / 1000).toFixed(1);
            loadingTime.textContent = elapsed + 's';
        }
    }

    hideLoadingScreen() {
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) {
            loadingScreen.style.display = 'none';
            this.showAircraftSelection();
        }
    }

    showAircraftSelection() {
        const selectionScreen = document.getElementById('aircraft-selection');
        if (selectionScreen) {
            selectionScreen.style.display = 'flex';
            
            // Add click handlers for aircraft selection
            document.querySelectorAll('.aircraft-card').forEach(card => {
                card.addEventListener('click', () => {
                    document.querySelectorAll('.aircraft-card').forEach(c => c.classList.remove('selected'));
                    card.classList.add('selected');
                    this.selectedAircraft = card.dataset.aircraft;
                    this.aircraftData = this.aircraftTypes[this.selectedAircraft];
                });
            });
            
            // Start flight button
            const startBtn = document.getElementById('start-flight');
            if (startBtn) {
                startBtn.addEventListener('click', () => {
                    selectionScreen.style.display = 'none';
                    this.startSimulation();
                });
            }
        }
    }

    createMinimalTerrain() {
        // Simple terrain
        const terrainGeometry = new THREE.PlaneGeometry(100000, 100000, 50, 50);
        const terrainMaterial = new THREE.MeshLambertMaterial({ color: 0x228B22 });
        this.terrain = new THREE.Mesh(terrainGeometry, terrainMaterial);
        this.terrain.rotation.x = -Math.PI / 2;
        this.terrain.position.y = -100;
        this.terrain.receiveShadow = true;
        this.scene.add(this.terrain);

        // Add a few simple mountains
        for (let i = 0; i < 10; i++) {
            const mountainGeometry = new THREE.ConeGeometry(
                Math.random() * 500 + 200,
                Math.random() * 1000 + 500,
                4
            );
            const mountainMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
            const mountain = new THREE.Mesh(mountainGeometry, mountainMaterial);
            
            mountain.position.set(
                (Math.random() - 0.5) * 80000,
                Math.random() * 500 + 250,
                (Math.random() - 0.5) * 80000
            );
            mountain.castShadow = true;
            this.scene.add(mountain);
        }
    }

    createMinimalEnvironment() {
        // Simple sky
        const skyGeometry = new THREE.SphereGeometry(25000, 16, 16);
        const skyMaterial = new THREE.MeshBasicMaterial({
            color: 0x87CEEB,
            side: THREE.BackSide
        });
        const sky = new THREE.Mesh(skyGeometry, skyMaterial);
        this.scene.add(sky);

        // Minimal clouds
        for (let i = 0; i < 20; i++) {
            const cloudGeometry = new THREE.SphereGeometry(
                Math.random() * 150 + 100,
                6, 4
            );
            const cloudMaterial = new THREE.MeshLambertMaterial({ 
                color: 0xffffff,
                transparent: true,
                opacity: 0.8
            });
            const cloud = new THREE.Mesh(cloudGeometry, cloudMaterial);
            
            cloud.position.set(
                (Math.random() - 0.5) * 80000,
                Math.random() * 3000 + 2000,
                (Math.random() - 0.5) * 80000
            );
            this.clouds.push(cloud);
            this.scene.add(cloud);
        }

        // Minimal buildings
        for (let i = 0; i < 20; i++) {
            const buildingGeometry = new THREE.BoxGeometry(
                Math.random() * 40 + 20,
                Math.random() * 200 + 100,
                Math.random() * 40 + 20
            );
            const buildingMaterial = new THREE.MeshLambertMaterial({ 
                color: new THREE.Color().setHSL(0.6, 0.3, 0.4 + Math.random() * 0.3)
            });
            const building = new THREE.Mesh(buildingGeometry, buildingMaterial);
            
            building.position.set(
                (Math.random() - 0.5) * 60000,
                Math.random() * 100 + 50,
                (Math.random() - 0.5) * 60000
            );
            building.castShadow = true;
            this.buildings.push(building);
            this.scene.add(building);
        }

        // Minimal trees
        for (let i = 0; i < 50; i++) {
            const treeGroup = new THREE.Group();
            
            const trunkGeometry = new THREE.CylinderGeometry(2, 3, 15, 4);
            const trunkMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
            const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
            trunk.position.y = 7.5;
            treeGroup.add(trunk);
            
            const leavesGeometry = new THREE.SphereGeometry(8, 4, 3);
            const leavesMaterial = new THREE.MeshLambertMaterial({ color: 0x228B22 });
            const leaves = new THREE.Mesh(leavesGeometry, leavesMaterial);
            leaves.position.y = 15;
            treeGroup.add(leaves);
            
            treeGroup.position.set(
                (Math.random() - 0.5) * 80000,
                -100,
                (Math.random() - 0.5) * 80000
            );
            treeGroup.castShadow = true;
            this.trees.push(treeGroup);
            this.scene.add(treeGroup);
        }
    }

    createAircraft() {
        const planeGroup = new THREE.Group();

        // Simple aircraft geometry
        const fuselageGeometry = new THREE.CylinderGeometry(2, 2, 20, 6);
        const fuselageMaterial = new THREE.MeshLambertMaterial({ color: 0xffffff });
        const fuselage = new THREE.Mesh(fuselageGeometry, fuselageMaterial);
        fuselage.rotation.z = Math.PI / 2;
        planeGroup.add(fuselage);

        // Wings
        const wingGeometry = new THREE.BoxGeometry(30, 1, 8);
        const wingMaterial = new THREE.MeshLambertMaterial({ color: 0xffffff });
        const wing = new THREE.Mesh(wingGeometry, wingMaterial);
        planeGroup.add(wing);

        // Tail
        const tailGeometry = new THREE.BoxGeometry(6, 8, 1);
        const tailMaterial = new THREE.MeshLambertMaterial({ color: 0xffffff });
        const tail = new THREE.Mesh(tailGeometry, tailMaterial);
        tail.position.set(0, 4, 0);
        planeGroup.add(tail);

        this.plane = planeGroup;
        this.plane.position.set(0, 100, 0);
        this.plane.castShadow = true;
        this.scene.add(this.plane);
    }

    setupControls() {
        // Camera controls
        const cameraButtons = document.querySelectorAll('.camera-btn');
        cameraButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                cameraButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.setCameraMode(btn.id);
            });
        });

        // Control panel
        const panelToggle = document.getElementById('panel-toggle');
        const panelContent = document.querySelector('.panel-content');
        if (panelToggle && panelContent) {
            panelToggle.addEventListener('click', () => {
                panelContent.style.display = panelContent.style.display === 'none' ? 'block' : 'none';
            });
        }

        // Engine toggle
        const engineToggle = document.getElementById('engineToggle');
        if (engineToggle) {
            engineToggle.addEventListener('click', () => {
                this.systems.engineRunning = !this.systems.engineRunning;
                engineToggle.innerHTML = this.systems.engineRunning ? 
                    '<i class="fas fa-power-off"></i> STOP ENGINE' : 
                    '<i class="fas fa-power-off"></i> START ENGINE';
            });
        }

        // Gear toggle
        const gearToggle = document.getElementById('gearToggle');
        if (gearToggle) {
            gearToggle.addEventListener('click', () => {
                this.systems.landingGear = !this.systems.landingGear;
                gearToggle.innerHTML = this.systems.landingGear ? 
                    '<i class="fas fa-arrow-down"></i> GEAR DOWN' : 
                    '<i class="fas fa-arrow-up"></i> GEAR UP';
            });
        }

        // Flaps toggle
        const flapsToggle = document.getElementById('flapsToggle');
        if (flapsToggle) {
            flapsToggle.addEventListener('click', () => {
                this.systems.flaps = !this.systems.flaps;
                flapsToggle.innerHTML = this.systems.flaps ? 
                    '<i class="fas fa-arrow-down"></i> FLAPS DOWN' : 
                    '<i class="fas fa-arrow-up"></i> FLAPS UP';
            });
        }

        // Sliders
        const throttleSlider = document.getElementById('throttleSlider');
        if (throttleSlider) {
            throttleSlider.addEventListener('input', (e) => {
                this.flightData.throttle = parseInt(e.target.value);
                document.getElementById('throttle').textContent = this.flightData.throttle;
            });
        }

        const pitchSlider = document.getElementById('pitchSlider');
        if (pitchSlider) {
            pitchSlider.addEventListener('input', (e) => {
                this.flightData.pitch = parseInt(e.target.value);
                document.getElementById('pitchControl').textContent = this.flightData.pitch;
            });
        }

        const rollSlider = document.getElementById('rollSlider');
        if (rollSlider) {
            rollSlider.addEventListener('input', (e) => {
                this.flightData.roll = parseInt(e.target.value);
                document.getElementById('rollControl').textContent = this.flightData.roll;
            });
        }

        // Keyboard controls
        document.addEventListener('keydown', (e) => {
            switch(e.key.toLowerCase()) {
                case 'w': this.flightData.pitch = Math.min(this.flightData.pitch + 5, 45); break;
                case 's': this.flightData.pitch = Math.max(this.flightData.pitch - 5, -45); break;
                case 'a': this.flightData.roll = Math.max(this.flightData.roll - 5, -45); break;
                case 'd': this.flightData.roll = Math.min(this.flightData.roll + 5, 45); break;
                case ' ': this.systems.engineRunning = !this.systems.engineRunning; break;
                case 'r': this.resetPosition(); break;
            }
        });
    }

    setCameraMode(mode) {
        switch(mode) {
            case 'cockpitView':
                this.camera.position.set(0, 102, 0);
                this.camera.lookAt(this.plane.position);
                break;
            case 'externalView':
                this.camera.position.set(0, 120, 50);
                this.camera.lookAt(this.plane.position);
                break;
            case 'towerView':
                this.camera.position.set(0, 200, 100);
                this.camera.lookAt(this.plane.position);
                break;
        }
    }

    initHUD() {
        // Initialize HUD elements
        this.updateHUD();
    }

    updateHUD() {
        try {
            // Update HUD values
            const speedEl = document.getElementById('speed');
            const altitudeEl = document.getElementById('altitude');
            const headingEl = document.getElementById('heading');
            const fuelEl = document.getElementById('fuel');
            
            if (speedEl) speedEl.textContent = Math.round(this.flightData.speed);
            if (altitudeEl) altitudeEl.textContent = Math.round(this.flightData.altitude);
            if (headingEl) headingEl.textContent = Math.round(this.flightData.heading);
            if (fuelEl) fuelEl.textContent = Math.round(this.flightData.fuel);
            
            // Update artificial horizon
            this.updateArtificialHorizon();
            
            // Update flight time
            const flightTime = Math.floor((Date.now() - this.startTime) / 1000);
            const hours = Math.floor(flightTime / 3600);
            const minutes = Math.floor((flightTime % 3600) / 60);
            const seconds = flightTime % 60;
            const timeStr = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
            
            const flightTimeEl = document.getElementById('flightTime-status');
            if (flightTimeEl) flightTimeEl.textContent = timeStr;
            
        } catch (error) {
            console.error('Error updating HUD:', error);
        }
    }

    updateArtificialHorizon() {
        const horizonLine = document.querySelector('.horizon-line');
        const pitchLadder = document.querySelector('.pitch-ladder');
        
        if (horizonLine) {
            horizonLine.style.transform = `rotate(${this.flightData.roll}deg)`;
        }
        
        if (pitchLadder) {
            pitchLadder.style.transform = `translateY(${this.flightData.pitch * 2}px)`;
        }
    }

    resetPosition() {
        this.flightData = {
            speed: 0,
            altitude: 100,
            heading: 0,
            pitch: 0,
            roll: 0,
            throttle: 0,
            fuel: 100
        };
        
        if (this.plane) {
            this.plane.position.set(0, 100, 0);
            this.plane.rotation.set(0, 0, 0);
        }
    }

    startSimulation() {
        // Start the simulation
        console.log('Simulation started!');
    }

    updateFlightData() {
        if (!this.clock) return;
        
        const delta = this.clock.getDelta();
        
        // Update flight physics
        if (this.systems.engineRunning && this.flightData.throttle > 0) {
            this.flightData.speed = Math.min(this.flightData.speed + this.flightData.throttle * 0.1, this.aircraftData.maxSpeed);
            this.flightData.altitude += this.flightData.pitch * 0.5;
            this.flightData.heading += this.flightData.roll * 0.1;
            this.flightData.fuel = Math.max(this.flightData.fuel - 0.01, 0);
        } else {
            this.flightData.speed = Math.max(this.flightData.speed - 0.5, 0);
        }
        
        // Update plane position
        if (this.plane) {
            this.plane.rotation.x = this.flightData.pitch * Math.PI / 180;
            this.plane.rotation.z = this.flightData.roll * Math.PI / 180;
            this.plane.rotation.y = this.flightData.heading * Math.PI / 180;
        }
    }

    updatePerformance() {
        this.frameCount++;
        const currentTime = performance.now();
        
        if (currentTime - this.lastTime >= 1000) {
            this.fps = Math.round((this.frameCount * 1000) / (currentTime - this.lastTime));
            this.frameCount = 0;
            this.lastTime = currentTime;
            
            const fpsEl = document.getElementById('fps');
            if (fpsEl) fpsEl.textContent = this.fps + ' FPS';
        }
    }

    animate() {
        try {
            requestAnimationFrame(() => this.animate());
            
            this.updateFlightData();
            this.updatePerformance();
            this.updateHUD();
            
            this.renderer.render(this.scene, this.camera);
        } catch (error) {
            console.error('Error in animation loop:', error);
        }
    }
}

// Initialize the simulator when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new FastFlightSimulator();
});
