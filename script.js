// 3D Flight Simulator Pro - Real Aircraft Simulator
class FlightSimulatorPro {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.plane = null;
        this.terrain = null;
        this.clouds = [];
        this.buildings = [];
        this.airports = [];
        
        // Aircraft types and specifications
        this.aircraftTypes = {
            cessna: {
                name: 'Cessna 172',
                maxSpeed: 126,
                maxAltitude: 14000,
                fuelCapacity: 56,
                engineRPM: 2700,
                stallSpeed: 48,
                takeoffSpeed: 55,
                landingSpeed: 50
            },
            boeing: {
                name: 'Boeing 737',
                maxSpeed: 450,
                maxAltitude: 41000,
                fuelCapacity: 26020,
                engineRPM: 15000,
                stallSpeed: 120,
                takeoffSpeed: 150,
                landingSpeed: 140
            },
            helicopter: {
                name: 'Bell 206',
                maxSpeed: 140,
                maxAltitude: 13000,
                fuelCapacity: 344,
                engineRPM: 6000,
                stallSpeed: 0,
                takeoffSpeed: 0,
                landingSpeed: 0
            },
            fighter: {
                name: 'F-16 Fighting Falcon',
                maxSpeed: 1500,
                maxAltitude: 50000,
                fuelCapacity: 7000,
                engineRPM: 15000,
                stallSpeed: 100,
                takeoffSpeed: 180,
                landingSpeed: 160
            }
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
            yaw: 0,
            throttle: 0,
            mixture: 100,
            propeller: 100,
            fuel: 100,
            temperature: 15,
            airspeed: 0,
            latitude: 0,
            longitude: 0,
            rpm: 0,
            oilPressure: 0,
            verticalSpeed: 0,
            trim: 0
        };
        
        // Systems
        this.systems = {
            engineRunning: false,
            landingGear: true,
            flaps: false,
            autopilot: false,
            gps: true,
            weather: 'clear',
            stallWarning: true,
            timeOfDay: 'day'
        };
        
        // Camera modes
        this.cameraModes = {
            COCKPIT: 'cockpit',
            EXTERNAL: 'external',
            TOWER: 'tower',
            CHASE: 'chase'
        };
        this.currentCameraMode = this.cameraModes.COCKPIT;
        
        // Controls
        this.keys = {};
        this.mouse = { x: 0, y: 0 };
        this.clock = new THREE.Clock();
        this.startTime = Date.now();
        
        // Performance
        this.frameCount = 0;
        this.lastTime = 0;
        this.fps = 60;
        
        this.init();
        this.setupEventListeners();
        this.showAircraftSelection();
    }

    async init() {
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
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.2;
        document.getElementById('scene-container').appendChild(this.renderer.domElement);

        // Lighting
        this.setupLighting();

        // Create environment
        await this.createEnvironment();

        // Create aircraft
        this.createAircraft();

        // Setup controls
        this.setupControls();

        // Initialize HUD
        this.initHUD();

        // Start animation
        this.animate();
    }

    showAircraftSelection() {
        const selectionScreen = document.getElementById('aircraft-selection');
        selectionScreen.style.display = 'flex';
        
        // Add click handlers for aircraft selection
        document.querySelectorAll('.aircraft-card').forEach(card => {
            card.addEventListener('click', () => {
                // Remove previous selection
                document.querySelectorAll('.aircraft-card').forEach(c => c.classList.remove('selected'));
                // Add selection to clicked card
                card.classList.add('selected');
                this.selectedAircraft = card.dataset.aircraft;
                this.aircraftData = this.aircraftTypes[this.selectedAircraft];
            });
        });
        
        // Start flight button
        document.getElementById('start-flight').addEventListener('click', () => {
            selectionScreen.style.display = 'none';
            this.startLoading();
        });
    }

    setupLighting() {
        // Ambient light
        const ambientLight = new THREE.AmbientLight(0x404040, 0.4);
        this.scene.add(ambientLight);

        // Directional light (sun)
        const directionalLight = new THREE.DirectionalLight(0xffffff, 1.2);
        directionalLight.position.set(1000, 1000, 500);
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 4096;
        directionalLight.shadow.mapSize.height = 4096;
        directionalLight.shadow.camera.near = 0.5;
        directionalLight.shadow.camera.far = 5000;
        directionalLight.shadow.camera.left = -2000;
        directionalLight.shadow.camera.right = 2000;
        directionalLight.shadow.camera.top = 2000;
        directionalLight.shadow.camera.bottom = -2000;
        this.scene.add(directionalLight);

        // Hemisphere light for better color balance
        const hemisphereLight = new THREE.HemisphereLight(0x87CEEB, 0x404040, 0.3);
        this.scene.add(hemisphereLight);
    }

    async createEnvironment() {
        // Create terrain
        this.createTerrain();

        // Create sky
        this.createSky();

        // Create clouds
        this.createClouds();

        // Create buildings and cities
        this.createBuildings();

        // Create airports
        this.createAirports();
    }

    createTerrain() {
        const terrainGeometry = new THREE.PlaneGeometry(100000, 100000, 200, 200);
        const terrainMaterial = new THREE.MeshLambertMaterial({ 
            color: 0x228B22,
            side: THREE.DoubleSide 
        });
        
        this.terrain = new THREE.Mesh(terrainGeometry, terrainMaterial);
        this.terrain.rotation.x = -Math.PI / 2;
        this.terrain.position.y = -100;
        this.terrain.receiveShadow = true;
        this.scene.add(this.terrain);

        // Add mountains
        for (let i = 0; i < 30; i++) {
            const mountainGeometry = new THREE.ConeGeometry(
                Math.random() * 800 + 300,
                Math.random() * 1500 + 800,
                12
            );
            const mountainMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
            const mountain = new THREE.Mesh(mountainGeometry, mountainMaterial);
            
            mountain.position.set(
                (Math.random() - 0.5) * 80000,
                Math.random() * 800 + 400,
                (Math.random() - 0.5) * 80000
            );
            mountain.castShadow = true;
            mountain.receiveShadow = true;
            this.scene.add(mountain);
        }

        // Add water bodies
        for (let i = 0; i < 5; i++) {
            const waterGeometry = new THREE.CircleGeometry(
                Math.random() * 2000 + 1000,
                32
            );
            const waterMaterial = new THREE.MeshLambertMaterial({ 
                color: 0x006994,
                transparent: true,
                opacity: 0.8
            });
            const water = new THREE.Mesh(waterGeometry, waterMaterial);
            
            water.rotation.x = -Math.PI / 2;
            water.position.set(
                (Math.random() - 0.5) * 60000,
                -95,
                (Math.random() - 0.5) * 60000
            );
            this.scene.add(water);
        }
    }

    createSky() {
        const skyGeometry = new THREE.SphereGeometry(40000, 64, 64);
        const skyMaterial = new THREE.MeshBasicMaterial({
            color: 0x87CEEB,
            side: THREE.BackSide
        });
        const sky = new THREE.Mesh(skyGeometry, skyMaterial);
        this.scene.add(sky);
    }

    createClouds() {
        for (let i = 0; i < 100; i++) {
            const cloudGroup = new THREE.Group();
            
            for (let j = 0; j < 8; j++) {
                const cloudGeometry = new THREE.SphereGeometry(
                    Math.random() * 150 + 80,
                    12,
                    8
                );
                const cloudMaterial = new THREE.MeshLambertMaterial({ 
                    color: 0xffffff,
                    transparent: true,
                    opacity: 0.9
                });
                const cloud = new THREE.Mesh(cloudGeometry, cloudMaterial);
                
                cloud.position.set(
                    (Math.random() - 0.5) * 300,
                    (Math.random() - 0.5) * 80,
                    (Math.random() - 0.5) * 300
                );
                cloudGroup.add(cloud);
            }
            
            cloudGroup.position.set(
                (Math.random() - 0.5) * 80000,
                Math.random() * 4000 + 1500,
                (Math.random() - 0.5) * 80000
            );
            
            this.clouds.push(cloudGroup);
            this.scene.add(cloudGroup);
        }
    }

    createBuildings() {
        // Create city buildings
        for (let i = 0; i < 50; i++) {
            const buildingGeometry = new THREE.BoxGeometry(
                Math.random() * 50 + 20,
                Math.random() * 200 + 50,
                Math.random() * 50 + 20
            );
            const buildingMaterial = new THREE.MeshLambertMaterial({ 
                color: new THREE.Color().setHSL(0, 0, Math.random() * 0.3 + 0.3)
            });
            const building = new THREE.Mesh(buildingGeometry, buildingMaterial);
            
            building.position.set(
                (Math.random() - 0.5) * 60000,
                Math.random() * 100 + 25,
                (Math.random() - 0.5) * 60000
            );
            building.castShadow = true;
            building.receiveShadow = true;
            this.buildings.push(building);
            this.scene.add(building);
        }
    }

    createAirports() {
        // Create runway
        const runwayGeometry = new THREE.PlaneGeometry(3000, 50);
        const runwayMaterial = new THREE.MeshLambertMaterial({ color: 0x333333 });
        const runway = new THREE.Mesh(runwayGeometry, runwayMaterial);
        runway.rotation.x = -Math.PI / 2;
        runway.position.set(0, -95, 0);
        runway.receiveShadow = true;
        this.scene.add(runway);

        // Create control tower
        const towerGeometry = new THREE.CylinderGeometry(10, 15, 60, 8);
        const towerMaterial = new THREE.MeshLambertMaterial({ color: 0x666666 });
        const tower = new THREE.Mesh(towerGeometry, towerMaterial);
        tower.position.set(0, -70, 0);
        tower.castShadow = true;
        this.scene.add(tower);

        // Create hangar
        const hangarGeometry = new THREE.BoxGeometry(100, 30, 60);
        const hangarMaterial = new THREE.MeshLambertMaterial({ color: 0x888888 });
        const hangar = new THREE.Mesh(hangarGeometry, hangarMaterial);
        hangar.position.set(200, -85, 0);
        hangar.castShadow = true;
        this.scene.add(hangar);
    }

    createAircraft() {
        const planeGroup = new THREE.Group();

        // Create aircraft based on selected type
        switch(this.selectedAircraft) {
            case 'cessna':
                this.createCessna(planeGroup);
                break;
            case 'boeing':
                this.createBoeing(planeGroup);
                break;
            case 'helicopter':
                this.createHelicopter(planeGroup);
                break;
            case 'fighter':
                this.createFighter(planeGroup);
                break;
            default:
                this.createCessna(planeGroup);
        }

        this.plane = planeGroup;
        this.plane.position.set(0, 100, 0);
        this.plane.castShadow = true;
        this.scene.add(this.plane);
    }

    createCessna(planeGroup) {
        // Fuselage
        const fuselageGeometry = new THREE.CylinderGeometry(2.5, 2, 25, 12);
        const fuselageMaterial = new THREE.MeshLambertMaterial({ color: 0xffffff });
        const fuselage = new THREE.Mesh(fuselageGeometry, fuselageMaterial);
        fuselage.rotation.z = Math.PI / 2;
        planeGroup.add(fuselage);

        // Wings
        const wingGeometry = new THREE.BoxGeometry(35, 1.5, 10);
        const wingMaterial = new THREE.MeshLambertMaterial({ color: 0xcccccc });
        const wings = new THREE.Mesh(wingGeometry, wingMaterial);
        wings.position.y = 0;
        planeGroup.add(wings);

        // Tail
        const tailGeometry = new THREE.BoxGeometry(5, 8, 1.5);
        const tailMaterial = new THREE.MeshLambertMaterial({ color: 0xcccccc });
        const tail = new THREE.Mesh(tailGeometry, tailMaterial);
        tail.position.set(12, 4, 0);
        planeGroup.add(tail);

        // Horizontal stabilizer
        const stabilizerGeometry = new THREE.BoxGeometry(10, 1.5, 4);
        const stabilizerMaterial = new THREE.MeshLambertMaterial({ color: 0xcccccc });
        const stabilizer = new THREE.Mesh(stabilizerGeometry, stabilizerMaterial);
        stabilizer.position.set(12, 0, 0);
        planeGroup.add(stabilizer);

        // Propeller
        const propellerGeometry = new THREE.BoxGeometry(0.3, 0.3, 8);
        const propellerMaterial = new THREE.MeshLambertMaterial({ color: 0x333333 });
        const propeller = new THREE.Mesh(propellerGeometry, propellerMaterial);
        propeller.position.set(-12.5, 0, 0);
        planeGroup.add(propeller);

        // Landing gear
        const gearGeometry = new THREE.CylinderGeometry(0.8, 0.8, 4);
        const gearMaterial = new THREE.MeshLambertMaterial({ color: 0x333333 });
        
        const frontGear = new THREE.Mesh(gearGeometry, gearMaterial);
        frontGear.position.set(-8, -2, 0);
        planeGroup.add(frontGear);

        const leftGear = new THREE.Mesh(gearGeometry, gearMaterial);
        leftGear.position.set(0, -2, 5);
        planeGroup.add(leftGear);

        const rightGear = new THREE.Mesh(gearGeometry, gearMaterial);
        rightGear.position.set(0, -2, -5);
        planeGroup.add(rightGear);

        // Cockpit
        const cockpitGeometry = new THREE.SphereGeometry(2, 8, 6);
        const cockpitMaterial = new THREE.MeshLambertMaterial({ 
            color: 0x000000,
            transparent: true,
            opacity: 0.7
        });
        const cockpit = new THREE.Mesh(cockpitGeometry, cockpitMaterial);
        cockpit.position.set(-5, 1, 0);
        planeGroup.add(cockpit);
    }

    createBoeing(planeGroup) {
        // Larger fuselage for commercial aircraft
        const fuselageGeometry = new THREE.CylinderGeometry(4, 3.5, 40, 16);
        const fuselageMaterial = new THREE.MeshLambertMaterial({ color: 0x2196f3 });
        const fuselage = new THREE.Mesh(fuselageGeometry, fuselageMaterial);
        fuselage.rotation.z = Math.PI / 2;
        planeGroup.add(fuselage);

        // Larger wings
        const wingGeometry = new THREE.BoxGeometry(50, 2, 15);
        const wingMaterial = new THREE.MeshLambertMaterial({ color: 0xcccccc });
        const wings = new THREE.Mesh(wingGeometry, wingMaterial);
        wings.position.y = 0;
        planeGroup.add(wings);

        // Tail
        const tailGeometry = new THREE.BoxGeometry(8, 12, 2);
        const tailMaterial = new THREE.MeshLambertMaterial({ color: 0xcccccc });
        const tail = new THREE.Mesh(tailGeometry, tailMaterial);
        tail.position.set(20, 6, 0);
        planeGroup.add(tail);

        // Engines
        const engineGeometry = new THREE.CylinderGeometry(1.5, 1.5, 8, 8);
        const engineMaterial = new THREE.MeshLambertMaterial({ color: 0x333333 });
        
        const leftEngine = new THREE.Mesh(engineGeometry, engineMaterial);
        leftEngine.position.set(-10, 0, 8);
        planeGroup.add(leftEngine);

        const rightEngine = new THREE.Mesh(engineGeometry, engineMaterial);
        rightEngine.position.set(-10, 0, -8);
        planeGroup.add(rightEngine);

        // Landing gear
        const gearGeometry = new THREE.CylinderGeometry(1.2, 1.2, 6);
        const gearMaterial = new THREE.MeshLambertMaterial({ color: 0x333333 });
        
        const frontGear = new THREE.Mesh(gearGeometry, gearMaterial);
        frontGear.position.set(-15, -3, 0);
        planeGroup.add(frontGear);

        const leftGear = new THREE.Mesh(gearGeometry, gearMaterial);
        leftGear.position.set(0, -3, 8);
        planeGroup.add(leftGear);

        const rightGear = new THREE.Mesh(gearGeometry, gearMaterial);
        rightGear.position.set(0, -3, -8);
        planeGroup.add(rightGear);
    }

    createHelicopter(planeGroup) {
        // Main rotor
        const rotorGeometry = new THREE.CylinderGeometry(0.5, 0.5, 20, 8);
        const rotorMaterial = new THREE.MeshLambertMaterial({ color: 0x333333 });
        const rotor = new THREE.Mesh(rotorGeometry, rotorMaterial);
        rotor.position.set(0, 5, 0);
        planeGroup.add(rotor);

        // Rotor blades
        const bladeGeometry = new THREE.BoxGeometry(15, 0.3, 1);
        const bladeMaterial = new THREE.MeshLambertMaterial({ color: 0x666666 });
        
        for (let i = 0; i < 4; i++) {
            const blade = new THREE.Mesh(bladeGeometry, bladeMaterial);
            blade.position.set(0, 5, 0);
            blade.rotation.y = (i * Math.PI) / 2;
            planeGroup.add(blade);
        }

        // Fuselage
        const fuselageGeometry = new THREE.CylinderGeometry(2, 2, 12, 8);
        const fuselageMaterial = new THREE.MeshLambertMaterial({ color: 0xff9722 });
        const fuselage = new THREE.Mesh(fuselageGeometry, fuselageMaterial);
        planeGroup.add(fuselage);

        // Tail rotor
        const tailRotorGeometry = new THREE.CylinderGeometry(0.3, 0.3, 8, 6);
        const tailRotorMaterial = new THREE.MeshLambertMaterial({ color: 0x333333 });
        const tailRotor = new THREE.Mesh(tailRotorGeometry, tailRotorMaterial);
        tailRotor.position.set(0, 2, -6);
        tailRotor.rotation.z = Math.PI / 2;
        planeGroup.add(tailRotor);

        // Landing skids
        const skidGeometry = new THREE.CylinderGeometry(0.2, 0.2, 8, 6);
        const skidMaterial = new THREE.MeshLambertMaterial({ color: 0x333333 });
        
        const leftSkid = new THREE.Mesh(skidGeometry, skidMaterial);
        leftSkid.position.set(-3, -2, 0);
        planeGroup.add(leftSkid);

        const rightSkid = new THREE.Mesh(skidGeometry, skidMaterial);
        rightSkid.position.set(3, -2, 0);
        planeGroup.add(rightSkid);
    }

    createFighter(planeGroup) {
        // Sleek fuselage
        const fuselageGeometry = new THREE.CylinderGeometry(1.5, 1, 20, 8);
        const fuselageMaterial = new THREE.MeshLambertMaterial({ color: 0x666666 });
        const fuselage = new THREE.Mesh(fuselageGeometry, fuselageMaterial);
        fuselage.rotation.z = Math.PI / 2;
        planeGroup.add(fuselage);

        // Delta wings
        const wingGeometry = new THREE.BoxGeometry(25, 0.5, 8);
        const wingMaterial = new THREE.MeshLambertMaterial({ color: 0x666666 });
        const wings = new THREE.Mesh(wingGeometry, wingMaterial);
        wings.position.y = 0;
        planeGroup.add(wings);

        // Tail
        const tailGeometry = new THREE.BoxGeometry(3, 6, 0.5);
        const tailMaterial = new THREE.MeshLambertMaterial({ color: 0x666666 });
        const tail = new THREE.Mesh(tailGeometry, tailMaterial);
        tail.position.set(8, 3, 0);
        planeGroup.add(tail);

        // Engine
        const engineGeometry = new THREE.CylinderGeometry(1, 1, 6, 8);
        const engineMaterial = new THREE.MeshLambertMaterial({ color: 0x333333 });
        const engine = new THREE.Mesh(engineGeometry, engineMaterial);
        engine.position.set(-8, 0, 0);
        planeGroup.add(engine);

        // Landing gear
        const gearGeometry = new THREE.CylinderGeometry(0.5, 0.5, 3);
        const gearMaterial = new THREE.MeshLambertMaterial({ color: 0x333333 });
        
        const frontGear = new THREE.Mesh(gearGeometry, gearMaterial);
        frontGear.position.set(-5, -1.5, 0);
        planeGroup.add(frontGear);

        const leftGear = new THREE.Mesh(gearGeometry, gearMaterial);
        leftGear.position.set(0, -1.5, 3);
        planeGroup.add(leftGear);

        const rightGear = new THREE.Mesh(gearGeometry, gearMaterial);
        rightGear.position.set(0, -1.5, -3);
        planeGroup.add(rightGear);
    }

    setupControls() {
        // Throttle control
        document.getElementById('throttleSlider').addEventListener('input', (e) => {
            this.flightData.throttle = parseFloat(e.target.value);
            document.getElementById('throttle').textContent = this.flightData.throttle;
        });

        // Mixture control
        document.getElementById('mixtureSlider').addEventListener('input', (e) => {
            this.flightData.mixture = parseFloat(e.target.value);
            document.getElementById('mixture').textContent = this.flightData.mixture;
        });

        // Flight controls
        document.getElementById('pitchSlider').addEventListener('input', (e) => {
            this.flightData.pitch = parseFloat(e.target.value);
            document.getElementById('pitchControl').textContent = this.flightData.pitch;
        });

        document.getElementById('rollSlider').addEventListener('input', (e) => {
            this.flightData.roll = parseFloat(e.target.value);
            document.getElementById('rollControl').textContent = this.flightData.roll;
        });

        document.getElementById('yawSlider').addEventListener('input', (e) => {
            this.flightData.yaw = parseFloat(e.target.value);
            document.getElementById('yawControl').textContent = this.flightData.yaw;
        });

        // System toggles
        document.getElementById('gearToggle').addEventListener('click', () => {
            this.systems.landingGear = !this.systems.landingGear;
            const btn = document.getElementById('gearToggle');
            if (this.systems.landingGear) {
                btn.innerHTML = '<i class="fas fa-arrow-down"></i> DOWN';
                btn.classList.add('active');
            } else {
                btn.innerHTML = '<i class="fas fa-arrow-up"></i> UP';
                btn.classList.remove('active');
            }
        });

        document.getElementById('flapsToggle').addEventListener('click', () => {
            this.systems.flaps = !this.systems.flaps;
            const btn = document.getElementById('flapsToggle');
            if (this.systems.flaps) {
                btn.innerHTML = '<i class="fas fa-arrow-down"></i> DOWN';
                btn.classList.add('active');
            } else {
                btn.innerHTML = '<i class="fas fa-arrow-up"></i> UP';
                btn.classList.remove('active');
            }
        });

        document.getElementById('autopilotToggle').addEventListener('click', () => {
            this.systems.autopilot = !this.systems.autopilot;
            const btn = document.getElementById('autopilotToggle');
            if (this.systems.autopilot) {
                btn.innerHTML = '<i class="fas fa-robot"></i> ON';
                btn.classList.add('active');
            } else {
                btn.innerHTML = '<i class="fas fa-robot"></i> OFF';
                btn.classList.remove('active');
            }
        });

        document.getElementById('gpsToggle').addEventListener('click', () => {
            this.systems.gps = !this.systems.gps;
            const btn = document.getElementById('gpsToggle');
            if (this.systems.gps) {
                btn.innerHTML = '<i class="fas fa-satellite"></i> ON';
                btn.classList.add('active');
            } else {
                btn.innerHTML = '<i class="fas fa-satellite"></i> OFF';
                btn.classList.remove('active');
            }
        });

        // Weather control
        document.getElementById('weatherSelect').addEventListener('change', (e) => {
            this.systems.weather = e.target.value;
            this.updateWeather();
        });

        // Panel toggle
        document.getElementById('panel-toggle').addEventListener('click', () => {
            const panel = document.getElementById('control-panel');
            panel.classList.toggle('collapsed');
        });

        // Camera controls
        document.getElementById('cockpitView').addEventListener('click', () => {
            this.setCameraMode(this.cameraModes.COCKPIT);
        });

        document.getElementById('externalView').addEventListener('click', () => {
            this.setCameraMode(this.cameraModes.EXTERNAL);
        });

        document.getElementById('towerView').addEventListener('click', () => {
            this.setCameraMode(this.cameraModes.TOWER);
        });

        document.getElementById('chaseView').addEventListener('click', () => {
            this.setCameraMode(this.cameraModes.CHASE);
        });
    }

    setCameraMode(mode) {
        this.currentCameraMode = mode;
        
        // Update button states
        document.querySelectorAll('.camera-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        switch(mode) {
            case this.cameraModes.COCKPIT:
                document.getElementById('cockpitView').classList.add('active');
                break;
            case this.cameraModes.EXTERNAL:
                document.getElementById('externalView').classList.add('active');
                break;
            case this.cameraModes.TOWER:
                document.getElementById('towerView').classList.add('active');
                break;
            case this.cameraModes.CHASE:
                document.getElementById('chaseView').classList.add('active');
                break;
        }
    }

    setupEventListeners() {
        // Keyboard controls
        document.addEventListener('keydown', (e) => {
            this.keys[e.code] = true;
            
            if (e.code === 'Space') {
                e.preventDefault();
                this.systems.autopilot = !this.systems.autopilot;
                const btn = document.getElementById('autopilotToggle');
                if (this.systems.autopilot) {
                    btn.innerHTML = '<i class="fas fa-robot"></i> ON';
                    btn.classList.add('active');
                } else {
                    btn.innerHTML = '<i class="fas fa-robot"></i> OFF';
                    btn.classList.remove('active');
                }
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

    initHUD() {
        // Initialize artificial horizon
        this.updateArtificialHorizon();
        
        // Initialize mini map
        this.initMiniMap();
    }

    updateArtificialHorizon() {
        const horizon = document.querySelector('.artificial-horizon');
        const pitchIndicator = document.querySelector('.pitch-indicator');
        const rollIndicator = document.querySelector('.roll-indicator');
        
        // Update pitch indicator
        const pitchOffset = (this.flightData.pitch / 45) * 50;
        pitchIndicator.style.transform = `translate(-50%, -50%) translateY(${pitchOffset}px)`;
        
        // Update roll indicator
        rollIndicator.style.transform = `translate(-50%, -50%) rotate(${this.flightData.roll}deg)`;
    }

    initMiniMap() {
        const canvas = document.getElementById('mapCanvas');
        const ctx = canvas.getContext('2d');
        
        // Draw map background
        ctx.fillStyle = '#1a1a1a';
        ctx.fillRect(0, 0, 200, 200);
        
        // Draw grid
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 1;
        for (let i = 0; i <= 200; i += 20) {
            ctx.beginPath();
            ctx.moveTo(i, 0);
            ctx.lineTo(i, 200);
            ctx.stroke();
            
            ctx.beginPath();
            ctx.moveTo(0, i);
            ctx.lineTo(200, i);
            ctx.stroke();
        }
        
        // Draw aircraft position
        ctx.fillStyle = '#ff4444';
        ctx.beginPath();
        ctx.arc(100, 100, 3, 0, Math.PI * 2);
        ctx.fill();
    }

    updateMiniMap() {
        const canvas = document.getElementById('mapCanvas');
        const ctx = canvas.getContext('2d');
        
        // Clear and redraw
        ctx.fillStyle = '#1a1a1a';
        ctx.fillRect(0, 0, 200, 200);
        
        // Draw grid
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 1;
        for (let i = 0; i <= 200; i += 20) {
            ctx.beginPath();
            ctx.moveTo(i, 0);
            ctx.lineTo(i, 200);
            ctx.stroke();
            
            ctx.beginPath();
            ctx.moveTo(0, i);
            ctx.lineTo(200, i);
            ctx.stroke();
        }
        
        // Calculate aircraft position on map
        const mapX = 100 + (this.plane.position.x / 1000) * 10;
        const mapZ = 100 + (this.plane.position.z / 1000) * 10;
        
        // Draw aircraft
        ctx.fillStyle = '#ff4444';
        ctx.beginPath();
        ctx.arc(mapX, mapZ, 3, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw heading indicator
        ctx.strokeStyle = '#4CAF50';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(mapX, mapZ);
        ctx.lineTo(
            mapX + Math.sin(THREE.MathUtils.degToRad(this.flightData.heading)) * 15,
            mapZ - Math.cos(THREE.MathUtils.degToRad(this.flightData.heading)) * 15
        );
        ctx.stroke();
    }

    startLoading() {
        const loadingScreen = document.getElementById('loading-screen');
        const progress = document.querySelector('.loading-progress');
        const loadingText = document.querySelector('.loading-text');
        
        let progressValue = 0;
        const loadingSteps = [
            'Initializing Systems...',
            'Loading 3D Environment...',
            'Creating Aircraft Model...',
            'Setting Up Controls...',
            'Starting Flight Simulator...'
        ];
        
        const loadingInterval = setInterval(() => {
            progressValue += Math.random() * 15 + 5;
            if (progressValue > 100) progressValue = 100;
            
            progress.style.width = progressValue + '%';
            
            const stepIndex = Math.floor((progressValue / 100) * loadingSteps.length);
            if (stepIndex < loadingSteps.length) {
                loadingText.textContent = loadingSteps[stepIndex];
            }
            
            if (progressValue >= 100) {
                clearInterval(loadingInterval);
                setTimeout(() => {
                    loadingScreen.style.opacity = '0';
                    setTimeout(() => {
                        loadingScreen.style.display = 'none';
                    }, 500);
                }, 500);
            }
        }, 100);
    }

    resetPosition() {
        this.plane.position.set(0, 100, 0);
        this.plane.rotation.set(0, 0, 0);
        
        this.flightData = {
            speed: 0,
            altitude: 100,
            heading: 0,
            pitch: 0,
            roll: 0,
            yaw: 0,
            throttle: 0,
            mixture: 100,
            fuel: 100,
            temperature: 15,
            airspeed: 0,
            latitude: 0,
            longitude: 0
        };
        
        // Reset UI
        document.getElementById('throttleSlider').value = 0;
        document.getElementById('mixtureSlider').value = 100;
        document.getElementById('pitchSlider').value = 0;
        document.getElementById('rollSlider').value = 0;
        document.getElementById('yawSlider').value = 0;
        
        document.getElementById('throttle').textContent = '0';
        document.getElementById('mixture').textContent = '100';
        document.getElementById('pitchControl').textContent = '0';
        document.getElementById('rollControl').textContent = '0';
        document.getElementById('yawControl').textContent = '0';
    }

    updateFlightData() {
        const delta = this.clock.getDelta();
        
        // Auto-pilot mode
        if (this.systems.autopilot) {
            this.flightData.throttle = Math.min(this.flightData.throttle + 10 * delta, 80);
            this.flightData.altitude = Math.min(this.flightData.altitude + 50 * delta, 5000);
            this.flightData.pitch = Math.sin(Date.now() * 0.001) * 5;
            this.flightData.roll = Math.sin(Date.now() * 0.002) * 10;
            this.flightData.heading += 5 * delta;
            
            // Update UI
            document.getElementById('throttleSlider').value = this.flightData.throttle;
            document.getElementById('pitchSlider').value = this.flightData.pitch;
            document.getElementById('rollSlider').value = this.flightData.roll;
            document.getElementById('yawSlider').value = this.flightData.heading;
            
            document.getElementById('throttle').textContent = Math.round(this.flightData.throttle);
            document.getElementById('pitchControl').textContent = Math.round(this.flightData.pitch);
            document.getElementById('rollControl').textContent = Math.round(this.flightData.roll);
            document.getElementById('yawControl').textContent = Math.round(this.flightData.heading);
        }

        // Manual controls
        if (this.keys['KeyW']) this.flightData.pitch += 30 * delta;
        if (this.keys['KeyS']) this.flightData.pitch -= 30 * delta;
        if (this.keys['KeyA']) this.flightData.roll -= 30 * delta;
        if (this.keys['KeyD']) this.flightData.roll += 30 * delta;

        // Calculate speed based on throttle
        this.flightData.speed = (this.flightData.throttle / 100) * 800;
        this.flightData.airspeed = this.flightData.speed * 0.54; // Convert to knots

        // Apply controls to plane
        this.plane.rotation.x = THREE.MathUtils.degToRad(this.flightData.pitch);
        this.plane.rotation.z = THREE.MathUtils.degToRad(this.flightData.roll);
        this.plane.rotation.y = THREE.MathUtils.degToRad(this.flightData.heading);

        // Move plane forward
        const speed = this.flightData.speed / 3.6; // Convert km/h to m/s
        const direction = new THREE.Vector3(0, 0, -1);
        direction.applyQuaternion(this.plane.quaternion);
        this.plane.position.add(direction.multiplyScalar(speed * delta));

        // Update altitude
        this.plane.position.y = this.flightData.altitude;

        // Update coordinates
        this.flightData.latitude = this.plane.position.x / 111000;
        this.flightData.longitude = this.plane.position.z / 111000;

        // Update fuel consumption
        if (this.flightData.throttle > 0) {
            this.flightData.fuel -= 0.01 * delta;
            if (this.flightData.fuel < 0) this.flightData.fuel = 0;
        }

        // Update HUD
        this.updateHUD();
        
        // Update camera
        this.updateCamera();
    }

    updateHUD() {
        // Update HUD values
        document.getElementById('speed').textContent = Math.round(this.flightData.speed);
        document.getElementById('altitude').textContent = Math.round(this.flightData.altitude);
        document.getElementById('heading').textContent = Math.round(this.flightData.heading);
        document.getElementById('pitch').textContent = Math.round(this.flightData.pitch);
        document.getElementById('airspeed').textContent = Math.round(this.flightData.airspeed);
        document.getElementById('fuel').textContent = Math.round(this.flightData.fuel);
        document.getElementById('latitude').textContent = this.flightData.latitude.toFixed(3);
        document.getElementById('longitude').textContent = this.flightData.longitude.toFixed(3);
        
        // Update artificial horizon
        this.updateArtificialHorizon();
        
        // Update mini map
        this.updateMiniMap();
        
        // Update flight time
        const flightTime = Math.floor((Date.now() - this.startTime) / 1000);
        const hours = Math.floor(flightTime / 3600);
        const minutes = Math.floor((flightTime % 3600) / 60);
        const seconds = flightTime % 60;
        document.getElementById('flightTime').textContent = 
            `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        
        // Update current time
        const now = new Date();
        document.getElementById('time').textContent = 
            `${now.getUTCHours().toString().padStart(2, '0')}:${now.getUTCMinutes().toString().padStart(2, '0')}`;
    }

    updateCamera() {
        switch (this.currentCameraMode) {
            case this.cameraModes.COCKPIT:
                // Cockpit view - inside the aircraft
                const cockpitOffset = new THREE.Vector3(-8, 2, 0);
                cockpitOffset.applyQuaternion(this.plane.quaternion);
                this.camera.position.copy(this.plane.position).add(cockpitOffset);
                this.camera.lookAt(this.plane.position.clone().add(
                    new THREE.Vector3(-20, 0, 0).applyQuaternion(this.plane.quaternion)
                ));
                break;
                
            case this.cameraModes.EXTERNAL:
                // External view - close to aircraft
                const externalOffset = new THREE.Vector3(0, 10, 30);
                externalOffset.applyQuaternion(this.plane.quaternion);
                this.camera.position.copy(this.plane.position).add(externalOffset);
                this.camera.lookAt(this.plane.position);
                break;
                
            case this.cameraModes.TOWER:
                // Tower view - from control tower
                this.camera.position.set(0, 50, 100);
                this.camera.lookAt(this.plane.position);
                break;
                
            case this.cameraModes.CHASE:
                // Chase view - following behind
                const chaseOffset = new THREE.Vector3(0, 20, 50);
                chaseOffset.applyQuaternion(this.plane.quaternion);
                this.camera.position.copy(this.plane.position).add(chaseOffset);
                this.camera.lookAt(this.plane.position);
                break;
        }
    }

    updateWeather() {
        switch (this.systems.weather) {
            case 'clear':
                this.scene.fog = new THREE.Fog(0x87CEEB, 1000, 20000);
                break;
            case 'cloudy':
                this.scene.fog = new THREE.Fog(0xCCCCCC, 500, 10000);
                break;
            case 'stormy':
                this.scene.fog = new THREE.Fog(0x666666, 200, 5000);
                break;
            case 'foggy':
                this.scene.fog = new THREE.Fog(0xDDDDDD, 100, 2000);
                break;
        }
    }

    updatePerformance() {
        this.frameCount++;
        const currentTime = performance.now();
        
        if (currentTime - this.lastTime >= 1000) {
            this.fps = Math.round((this.frameCount * 1000) / (currentTime - this.lastTime));
            document.getElementById('fps').textContent = this.fps + ' FPS';
            this.frameCount = 0;
            this.lastTime = currentTime;
        }
    }

    animate() {
        requestAnimationFrame(() => this.animate());
        
        this.updateFlightData();
        this.updatePerformance();
        this.renderer.render(this.scene, this.camera);
    }
}

// Initialize the simulator when the page loads
window.addEventListener('load', () => {
    new FlightSimulatorPro();
});
