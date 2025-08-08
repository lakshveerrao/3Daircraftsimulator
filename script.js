// Complete 3D Aircraft Simulator - FlightGear Style
class CompleteFlightSimulator {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.plane = null;
        this.terrain = null;
        this.clouds = [];
        this.buildings = [];
        this.airports = [];
        this.trees = [];
        this.runways = [];
        
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
                landingSpeed: 50,
                // FlightGear-style physics
                wingArea: 174,
                weight: 2300,
                dragCoefficient: 0.027,
                liftCoefficient: 0.4,
                thrust: 180
            },
            boeing: {
                name: 'Boeing 737',
                maxSpeed: 450,
                maxAltitude: 41000,
                fuelCapacity: 26020,
                engineRPM: 15000,
                stallSpeed: 120,
                takeoffSpeed: 150,
                landingSpeed: 140,
                wingArea: 1344,
                weight: 150000,
                dragCoefficient: 0.025,
                liftCoefficient: 0.6,
                thrust: 27000
            },
            helicopter: {
                name: 'Bell 206',
                maxSpeed: 140,
                maxAltitude: 13000,
                fuelCapacity: 344,
                engineRPM: 6000,
                stallSpeed: 0,
                takeoffSpeed: 0,
                landingSpeed: 0,
                rotorDiameter: 33.83,
                weight: 3200,
                hoverPower: 400
            },
            fighter: {
                name: 'F-16 Fighting Falcon',
                maxSpeed: 1500,
                maxAltitude: 50000,
                fuelCapacity: 7000,
                engineRPM: 15000,
                stallSpeed: 100,
                takeoffSpeed: 180,
                landingSpeed: 160,
                wingArea: 300,
                weight: 19000,
                dragCoefficient: 0.015,
                liftCoefficient: 0.8,
                thrust: 29000
            }
        };
        
        this.selectedAircraft = 'cessna';
        this.aircraftData = this.aircraftTypes.cessna;
        
        // Flight data with FlightGear-style physics
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
            trim: 0,
            // FlightGear additions
            trueAirspeed: 0,
            groundSpeed: 0,
            mach: 0,
            gForce: 1.0,
            angleOfAttack: 0,
            lift: 0,
            drag: 0,
            thrust: 0,
            weight: 0,
            centerOfGravity: { x: 0, y: 0, z: 0 },
            momentOfInertia: { x: 0, y: 0, z: 0 }
        };
        
        // Systems with FlightGear enhancements
        this.systems = {
            engineRunning: false,
            landingGear: true,
            flaps: false,
            autopilot: false,
            gps: true,
            weather: 'clear',
            stallWarning: true,
            timeOfDay: 'day',
            // FlightGear additions
            atc: false,
            transponder: false,
            navigationLights: true,
            landingLights: false,
            antiIce: false,
            deicing: false,
            oxygen: false,
            pressurization: false,
            fuelPumps: [true, true],
            fuelTanks: [100, 100],
            electricalSystem: true,
            hydraulicSystem: true,
            flightPlan: null,
            waypoints: [],
            currentWaypoint: 0
        };
        
        // Performance tracking
        this.frameCount = 0;
        this.lastTime = performance.now();
        this.fps = 60;
        this.startTime = Date.now();
        this.loadStartTime = performance.now();
        
        // Enhanced Camera modes
        this.cameraModes = {
            COCKPIT: 'cockpit',
            EXTERNAL: 'external',
            TOWER: 'tower',
            CHASE: 'chase',
            DOOR: 'door',
            DOWN: 'down',
            FRONT: 'front'
        };
        this.currentCameraMode = this.cameraModes.COCKPIT;
        
        // Controls
        this.keys = {};
        this.mouse = { x: 0, y: 0 };
        
        // Clock for animations
        this.clock = new THREE.Clock();
        
        // Mobile controls
        this.touchControls = {
            joystick: { x: 0, y: 0 },
            throttle: 0
        };
        
        // FlightGear-style ATC and navigation
        this.atc = {
            frequency: 118.1,
            squawk: 1200,
            callsign: 'N12345',
            clearance: null,
            instructions: []
        };
        
        this.navigation = {
            vor: [],
            ils: [],
            ndb: [],
            gps: {
                satellites: 8,
                accuracy: 3,
                fix: true
            }
        };
        
        // Weather system (FlightGear-style)
        this.weather = {
            visibility: 10,
            ceiling: 3000,
            windSpeed: 5,
            windDirection: 270,
            temperature: 15,
            pressure: 29.92,
            humidity: 60,
            turbulence: 0,
            icing: false,
            thunderstorms: false
        };
        
        // Initialize
        this.init();
        this.setupEventListeners();
    }

    async init() {
        // Start loading timer
        this.loadStartTime = performance.now();
        this.updateLoadingProgress(10, 'Initializing scene...');
        
        // Scene setup
        this.scene = new THREE.Scene();
        this.scene.fog = new THREE.Fog(0x87CEEB, 1000, 20000);
        
        this.updateLoadingProgress(20, 'Setting up camera...');
        
        // Camera setup
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 50000);
        this.camera.position.set(0, 100, 0);
        
        this.updateLoadingProgress(30, 'Configuring renderer...');
        
        // Renderer setup with performance optimizations
        this.renderer = new THREE.WebGLRenderer({ 
            antialias: false,
            powerPreference: "high-performance"
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setClearColor(0x87CEEB);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFShadowMap;
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.2;
        document.getElementById('scene-container').appendChild(this.renderer.domElement);
        
        this.updateLoadingProgress(40, 'Setting up lighting...');
        
        // Enhanced lighting
        this.setupLighting();
        
        this.updateLoadingProgress(50, 'Creating environment...');
        
        // Create complete environment
        await this.createEnvironment();
        
        this.updateLoadingProgress(70, 'Creating aircraft...');
        
        // Create aircraft
        this.createAircraft();
        
        this.updateLoadingProgress(80, 'Setting up controls...');
        
        // Setup controls
        this.setupControls();
        
        this.updateLoadingProgress(90, 'Initializing HUD...');
        
        // Initialize HUD and instruments
        this.initHUD();
        this.initMiniMap();
        
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

    setupLighting() {
        // Ambient light
        const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
        this.scene.add(ambientLight);

        // Directional light (sun) with optimized shadows
        const directionalLight = new THREE.DirectionalLight(0xffffff, 1.0);
        directionalLight.position.set(1000, 1000, 500);
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        directionalLight.shadow.camera.near = 0.5;
        directionalLight.shadow.camera.far = 5000;
        directionalLight.shadow.camera.left = -2000;
        directionalLight.shadow.camera.right = 2000;
        directionalLight.shadow.camera.top = 2000;
        directionalLight.shadow.camera.bottom = -2000;
        this.scene.add(directionalLight);

        // Hemisphere light for better color balance
        const hemisphereLight = new THREE.HemisphereLight(0x87CEEB, 0x404040, 0.4);
        this.scene.add(hemisphereLight);
    }

    async createEnvironment() {
        // Create enhanced terrain with realistic features
        this.createEnhancedTerrain();

        // Create dynamic sky
        this.createDynamicSky();

        // Create realistic clouds
        this.createRealisticClouds();

        // Create detailed buildings and cities
        this.createDetailedBuildings();

        // Create realistic airports with runways
        this.createRealisticAirports();

        // Create trees and vegetation
        this.createTrees();

        // Create water bodies
        this.createWaterBodies();

        // Create vehicles and people
        this.createVehicles();
        this.createPeople();
    }

    createEnhancedTerrain() {
        // Create simplified terrain with reduced geometry
        const terrainGeometry = new THREE.PlaneGeometry(150000, 150000, 100, 100);
        
        // Create heightmap for realistic terrain
        const vertices = terrainGeometry.attributes.position.array;
        for (let i = 0; i < vertices.length; i += 3) {
            const x = vertices[i];
            const z = vertices[i + 2];
            vertices[i + 1] = Math.sin(x * 0.001) * 100 + Math.cos(z * 0.001) * 100;
        }
        terrainGeometry.attributes.position.needsUpdate = true;
        terrainGeometry.computeVertexNormals();
        
        const terrainMaterial = new THREE.MeshLambertMaterial({ 
            color: 0x228B22,
            side: THREE.DoubleSide 
        });
        
        this.terrain = new THREE.Mesh(terrainGeometry, terrainMaterial);
        this.terrain.rotation.x = -Math.PI / 2;
        this.terrain.position.y = -100;
        this.terrain.receiveShadow = true;
        this.scene.add(this.terrain);

        // Add simplified mountains with reduced count
        for (let i = 0; i < 20; i++) {
            const mountainType = Math.random();
            let mountainGeometry;
            
            if (mountainType < 0.3) {
                // Sharp peaks
                mountainGeometry = new THREE.ConeGeometry(
                    Math.random() * 1000 + 400,
                    Math.random() * 2000 + 1000,
                    6
                );
            } else if (mountainType < 0.6) {
                // Rounded mountains
                mountainGeometry = new THREE.SphereGeometry(
                    Math.random() * 800 + 300,
                    6, 4
                );
            } else {
                // Plateaus
                mountainGeometry = new THREE.CylinderGeometry(
                    Math.random() * 600 + 200,
                    Math.random() * 600 + 200,
                    Math.random() * 800 + 400,
                    6
                );
            }
            
            const mountainMaterial = new THREE.MeshLambertMaterial({ 
                color: new THREE.Color().setHSL(0.1, 0.6, 0.3 + Math.random() * 0.2)
            });
            const mountain = new THREE.Mesh(mountainGeometry, mountainMaterial);
            
            mountain.position.set(
                (Math.random() - 0.5) * 120000,
                Math.random() * 1000 + 500,
                (Math.random() - 0.5) * 120000
            );
            mountain.castShadow = true;
            mountain.receiveShadow = true;
            this.scene.add(mountain);
        }

        // Add simplified hills with reduced count
        for (let i = 0; i < 40; i++) {
            const hillGeometry = new THREE.SphereGeometry(
                Math.random() * 300 + 100,
                4, 3
            );
            const hillMaterial = new THREE.MeshLambertMaterial({ 
                color: new THREE.Color().setHSL(0.2, 0.5, 0.4 + Math.random() * 0.3)
            });
            const hill = new THREE.Mesh(hillGeometry, hillMaterial);
            
            hill.position.set(
                (Math.random() - 0.5) * 100000,
                Math.random() * 200 + 50,
                (Math.random() - 0.5) * 100000
            );
            hill.castShadow = true;
            hill.receiveShadow = true;
            this.scene.add(hill);
        }
    }

    createDynamicSky() {
        const skyGeometry = new THREE.SphereGeometry(50000, 32, 32);
        const skyMaterial = new THREE.MeshBasicMaterial({
            color: 0x87CEEB,
            side: THREE.BackSide
        });
        const sky = new THREE.Mesh(skyGeometry, skyMaterial);
        this.scene.add(sky);
    }

    createRealisticClouds() {
        for (let i = 0; i < 50; i++) {
            const cloudGroup = new THREE.Group();
            
            // Create simplified cloud shapes
            for (let j = 0; j < 6; j++) {
                const cloudGeometry = new THREE.SphereGeometry(
                    Math.random() * 200 + 100,
                    8, 6
                );
                const cloudMaterial = new THREE.MeshLambertMaterial({ 
                    color: 0xffffff,
                    transparent: true,
                    opacity: 0.8 + Math.random() * 0.2
                });
                const cloud = new THREE.Mesh(cloudGeometry, cloudMaterial);
                
                cloud.position.set(
                    (Math.random() - 0.5) * 400,
                    (Math.random() - 0.5) * 100,
                    (Math.random() - 0.5) * 400
                );
                cloudGroup.add(cloud);
            }
            
            cloudGroup.position.set(
                (Math.random() - 0.5) * 100000,
                Math.random() * 5000 + 2000,
                (Math.random() - 0.5) * 100000
            );
            
            this.clouds.push(cloudGroup);
            this.scene.add(cloudGroup);
        }
    }

    createDetailedBuildings() {
        // Create city buildings with reduced count
        for (let i = 0; i < 40; i++) {
            const buildingType = Math.random();
            let buildingGeometry;
            
            if (buildingType < 0.3) {
                // Skyscrapers
                buildingGeometry = new THREE.BoxGeometry(
                    Math.random() * 40 + 30,
                    Math.random() * 300 + 150,
                    Math.random() * 40 + 30
                );
            } else if (buildingType < 0.6) {
                // Office buildings
                buildingGeometry = new THREE.BoxGeometry(
                    Math.random() * 60 + 40,
                    Math.random() * 150 + 80,
                    Math.random() * 60 + 40
                );
            } else {
                // Residential buildings
                buildingGeometry = new THREE.BoxGeometry(
                    Math.random() * 30 + 20,
                    Math.random() * 100 + 50,
                    Math.random() * 30 + 20
                );
            }
            
            const buildingMaterial = new THREE.MeshLambertMaterial({ 
                color: new THREE.Color().setHSL(0.6, 0.3, 0.4 + Math.random() * 0.3)
            });
            const building = new THREE.Mesh(buildingGeometry, buildingMaterial);
            
            building.position.set(
                (Math.random() - 0.5) * 80000,
                Math.random() * 200 + 50,
                (Math.random() - 0.5) * 80000
            );
            building.castShadow = true;
            building.receiveShadow = true;
            this.buildings.push(building);
            this.scene.add(building);
        }
    }

    createRealisticAirports() {
        // Create multiple airports with detailed runways
        for (let airport = 0; airport < 3; airport++) {
            const airportX = (Math.random() - 0.5) * 100000;
            const airportZ = (Math.random() - 0.5) * 100000;
            
            // Create main runway
            const runwayGeometry = new THREE.PlaneGeometry(4000, 60);
            const runwayMaterial = new THREE.MeshLambertMaterial({ color: 0x333333 });
            const runway = new THREE.Mesh(runwayGeometry, runwayMaterial);
            runway.rotation.x = -Math.PI / 2;
            runway.position.set(airportX, -95, airportZ);
            runway.receiveShadow = true;
            this.scene.add(runway);
            this.runways.push(runway);

            // Create runway markings
            for (let i = 0; i < 20; i++) {
                const markingGeometry = new THREE.PlaneGeometry(2, 30);
                const markingMaterial = new THREE.MeshLambertMaterial({ color: 0xffffff });
                const marking = new THREE.Mesh(markingGeometry, markingMaterial);
                marking.rotation.x = -Math.PI / 2;
                marking.position.set(
                    airportX + (i - 10) * 200,
                    -94,
                    airportZ
                );
                this.scene.add(marking);
            }

            // Create control tower
            const towerGeometry = new THREE.CylinderGeometry(8, 12, 50, 8);
            const towerMaterial = new THREE.MeshLambertMaterial({ color: 0x666666 });
            const tower = new THREE.Mesh(towerGeometry, towerMaterial);
            tower.position.set(airportX + 100, -70, airportZ);
            tower.castShadow = true;
            this.scene.add(tower);

            // Create hangar
            const hangarGeometry = new THREE.BoxGeometry(80, 25, 50);
            const hangarMaterial = new THREE.MeshLambertMaterial({ color: 0x888888 });
            const hangar = new THREE.Mesh(hangarGeometry, hangarMaterial);
            hangar.position.set(airportX + 200, -87, airportZ);
            hangar.castShadow = true;
            this.scene.add(hangar);

            // Create terminal building
            const terminalGeometry = new THREE.BoxGeometry(120, 20, 40);
            const terminalMaterial = new THREE.MeshLambertMaterial({ color: 0xaaaaaa });
            const terminal = new THREE.Mesh(terminalGeometry, terminalMaterial);
            terminal.position.set(airportX - 150, -90, airportZ);
            terminal.castShadow = true;
            this.scene.add(terminal);
        }
    }

    createTrees() {
        // Create simplified trees with reduced count using instanced meshes
        for (let i = 0; i < 100; i++) {
            const treeType = Math.random();
            let treeGroup = new THREE.Group();
            
            if (treeType < 0.4) {
                // Pine trees
                const trunkGeometry = new THREE.CylinderGeometry(2, 3, 20, 6);
                const trunkMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
                const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
                trunk.position.y = 10;
                treeGroup.add(trunk);
                
                const leavesGeometry = new THREE.ConeGeometry(8, 25, 6);
                const leavesMaterial = new THREE.MeshLambertMaterial({ color: 0x228B22 });
                const leaves = new THREE.Mesh(leavesGeometry, leavesMaterial);
                leaves.position.y = 25;
                treeGroup.add(leaves);
                
            } else if (treeType < 0.7) {
                // Oak trees
                const trunkGeometry = new THREE.CylinderGeometry(3, 4, 15, 6);
                const trunkMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
                const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
                trunk.position.y = 7.5;
                treeGroup.add(trunk);
                
                const leavesGeometry = new THREE.SphereGeometry(12, 6, 4);
                const leavesMaterial = new THREE.MeshLambertMaterial({ color: 0x32CD32 });
                const leaves = new THREE.Mesh(leavesGeometry, leavesMaterial);
                leaves.position.y = 20;
                treeGroup.add(leaves);
                
            } else {
                // Palm trees
                const trunkGeometry = new THREE.CylinderGeometry(1, 1, 25, 6);
                const trunkMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
                const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
                trunk.position.y = 12.5;
                treeGroup.add(trunk);
                
                for (let j = 0; j < 6; j++) {
                    const leafGeometry = new THREE.BoxGeometry(1, 15, 0.5);
                    const leafMaterial = new THREE.MeshLambertMaterial({ color: 0x228B22 });
                    const leaf = new THREE.Mesh(leafGeometry, leafMaterial);
                    leaf.position.y = 25;
                    leaf.rotation.y = (j * Math.PI) / 3;
                    treeGroup.add(leaf);
                }
            }
            
            treeGroup.position.set(
                (Math.random() - 0.5) * 120000,
                -100,
                (Math.random() - 0.5) * 120000
            );
            treeGroup.castShadow = true;
            treeGroup.receiveShadow = true;
            this.trees.push(treeGroup);
            this.scene.add(treeGroup);
        }
    }

    createWaterBodies() {
        // Create simplified lakes and rivers
        for (let i = 0; i < 4; i++) {
            const waterGeometry = new THREE.CircleGeometry(
                Math.random() * 3000 + 1500,
                16
            );
            const waterMaterial = new THREE.MeshLambertMaterial({ 
                color: 0x006994,
                transparent: true,
                opacity: 0.7
            });
            const water = new THREE.Mesh(waterGeometry, waterMaterial);
            
            water.rotation.x = -Math.PI / 2;
            water.position.set(
                (Math.random() - 0.5) * 100000,
                -95,
                (Math.random() - 0.5) * 100000
            );
            this.scene.add(water);
        }
    }

    createVehicles() {
        // Create cars, buses, and other vehicles
        for (let i = 0; i < 30; i++) {
            const vehicleType = Math.random();
            let vehicleGroup = new THREE.Group();
            
            if (vehicleType < 0.6) {
                // Cars
                const carGeometry = new THREE.BoxGeometry(4, 2, 8);
                const carMaterial = new THREE.MeshLambertMaterial({ 
                    color: new THREE.Color().setHSL(Math.random(), 0.7, 0.5)
                });
                const car = new THREE.Mesh(carGeometry, carMaterial);
                vehicleGroup.add(car);
                
                // Car wheels
                for (let j = 0; j < 4; j++) {
                    const wheelGeometry = new THREE.CylinderGeometry(0.8, 0.8, 0.5, 8);
                    const wheelMaterial = new THREE.MeshLambertMaterial({ color: 0x333333 });
                    const wheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
                    wheel.rotation.z = Math.PI / 2;
                    wheel.position.set(
                        (j < 2 ? -1.5 : 1.5),
                        -1,
                        (j % 2 === 0 ? -3.5 : 3.5)
                    );
                    vehicleGroup.add(wheel);
                }
                
            } else if (vehicleType < 0.8) {
                // Buses
                const busGeometry = new THREE.BoxGeometry(3, 4, 12);
                const busMaterial = new THREE.MeshLambertMaterial({ 
                    color: new THREE.Color().setHSL(0.6, 0.8, 0.4)
                });
                const bus = new THREE.Mesh(busGeometry, busMaterial);
                vehicleGroup.add(bus);
                
                // Bus wheels
                for (let j = 0; j < 6; j++) {
                    const wheelGeometry = new THREE.CylinderGeometry(1, 1, 0.5, 8);
                    const wheelMaterial = new THREE.MeshLambertMaterial({ color: 0x333333 });
                    const wheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
                    wheel.rotation.z = Math.PI / 2;
                    wheel.position.set(
                        (j < 3 ? -1.5 : 1.5),
                        -2,
                        (j % 3 === 0 ? -4 : j % 3 === 1 ? 0 : 4)
                    );
                    vehicleGroup.add(wheel);
                }
                
            } else {
                // Trucks
                const truckGeometry = new THREE.BoxGeometry(3, 3, 10);
                const truckMaterial = new THREE.MeshLambertMaterial({ 
                    color: new THREE.Color().setHSL(0.1, 0.6, 0.4)
                });
                const truck = new THREE.Mesh(truckGeometry, truckMaterial);
                vehicleGroup.add(truck);
                
                // Truck wheels
                for (let j = 0; j < 4; j++) {
                    const wheelGeometry = new THREE.CylinderGeometry(1, 1, 0.5, 8);
                    const wheelMaterial = new THREE.MeshLambertMaterial({ color: 0x333333 });
                    const wheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
                    wheel.rotation.z = Math.PI / 2;
                    wheel.position.set(
                        (j < 2 ? -1.5 : 1.5),
                        -1.5,
                        (j % 2 === 0 ? -3.5 : 3.5)
                    );
                    vehicleGroup.add(wheel);
                }
            }
            
            vehicleGroup.position.set(
                (Math.random() - 0.5) * 80000,
                -98,
                (Math.random() - 0.5) * 80000
            );
            vehicleGroup.castShadow = true;
            vehicleGroup.receiveShadow = true;
            this.scene.add(vehicleGroup);
        }
    }

    createPeople() {
        // Create people with simple geometry
        for (let i = 0; i < 50; i++) {
            const personGroup = new THREE.Group();
            
            // Head
            const headGeometry = new THREE.SphereGeometry(0.5, 6, 4);
            const headMaterial = new THREE.MeshLambertMaterial({ 
                color: new THREE.Color().setHSL(0.1, 0.3, 0.7 + Math.random() * 0.3)
            });
            const head = new THREE.Mesh(headGeometry, headMaterial);
            head.position.y = 1.7;
            personGroup.add(head);
            
            // Body
            const bodyGeometry = new THREE.CylinderGeometry(0.4, 0.6, 1.2, 6);
            const bodyMaterial = new THREE.MeshLambertMaterial({ 
                color: new THREE.Color().setHSL(Math.random(), 0.5, 0.4 + Math.random() * 0.3)
            });
            const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
            body.position.y = 0.8;
            personGroup.add(body);
            
            // Arms
            const armGeometry = new THREE.CylinderGeometry(0.15, 0.15, 0.8, 4);
            const armMaterial = new THREE.MeshLambertMaterial({ 
                color: new THREE.Color().setHSL(0.1, 0.3, 0.7 + Math.random() * 0.3)
            });
            
            const leftArm = new THREE.Mesh(armGeometry, armMaterial);
            leftArm.position.set(-0.6, 0.8, 0);
            leftArm.rotation.z = Math.PI / 4;
            personGroup.add(leftArm);
            
            const rightArm = new THREE.Mesh(armGeometry, armMaterial);
            rightArm.position.set(0.6, 0.8, 0);
            rightArm.rotation.z = -Math.PI / 4;
            personGroup.add(rightArm);
            
            // Legs
            const legGeometry = new THREE.CylinderGeometry(0.2, 0.2, 0.8, 4);
            const legMaterial = new THREE.MeshLambertMaterial({ 
                color: new THREE.Color().setHSL(0.1, 0.3, 0.4 + Math.random() * 0.3)
            });
            
            const leftLeg = new THREE.Mesh(legGeometry, legMaterial);
            leftLeg.position.set(-0.5, -0.2, 0);
            personGroup.add(leftLeg);
            
            const rightLeg = new THREE.Mesh(legGeometry, legMaterial);
            rightLeg.position.set(0.5, -0.2, 0);
            personGroup.add(rightLeg);
            
            personGroup.position.set(
                (Math.random() - 0.5) * 80000,
                -98,
                (Math.random() - 0.5) * 80000
            );
            personGroup.castShadow = true;
            personGroup.receiveShadow = true;
            this.scene.add(personGroup);
        }
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
                this.currentCameraMode = 'cockpit';
                break;
            case 'externalView':
                this.camera.position.set(0, 120, 50);
                this.camera.lookAt(this.plane.position);
                this.currentCameraMode = 'external';
                break;
            case 'towerView':
                this.camera.position.set(0, 200, 100);
                this.camera.lookAt(this.plane.position);
                this.currentCameraMode = 'tower';
                break;
            case 'chaseView':
                this.camera.position.set(0, 110, -30);
                this.camera.lookAt(this.plane.position);
                this.currentCameraMode = 'chase';
                break;
            case 'doorView':
                this.camera.position.set(20, 105, 0);
                this.camera.lookAt(this.plane.position);
                this.currentCameraMode = 'door';
                break;
            case 'downView':
                this.camera.position.set(0, 150, 0);
                this.camera.lookAt(this.plane.position);
                this.currentCameraMode = 'down';
                break;
            case 'frontView':
                this.camera.position.set(0, 105, 30);
                this.camera.lookAt(this.plane.position);
                this.currentCameraMode = 'front';
                break;
        }
    }

    updateMobileCameraButtons(activeButtonId) {
        const mobileCameraBtns = [
            'mobile-cockpit-view',
            'mobile-external-view', 
            'mobile-tower-view',
            'mobile-chase-view',
            'mobile-door-view',
            'mobile-down-view',
            'mobile-front-view'
        ];

        mobileCameraBtns.forEach(btnId => {
            const button = document.getElementById(btnId);
            if (button) {
                if (btnId === activeButtonId) {
                    button.classList.add('active');
                } else {
                    button.classList.remove('active');
                }
            }
        });
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
            
            // Camera switching keyboard shortcuts
            if (e.code === 'KeyC') {
                e.preventDefault();
                this.setCameraMode('cockpitView');
                this.updateMobileCameraButtons('mobile-cockpit-view');
            }
            
            if (e.code === 'KeyV') {
                e.preventDefault();
                this.setCameraMode('externalView');
                this.updateMobileCameraButtons('mobile-external-view');
            }
            
            if (e.code === 'KeyT') {
                e.preventDefault();
                this.setCameraMode('towerView');
                this.updateMobileCameraButtons('mobile-tower-view');
            }
            
            if (e.code === 'KeyH') {
                e.preventDefault();
                this.setCameraMode('chaseView');
                this.updateMobileCameraButtons('mobile-chase-view');
            }
            
            if (e.code === 'KeyD') {
                e.preventDefault();
                this.setCameraMode('doorView');
                this.updateMobileCameraButtons('mobile-door-view');
            }
            
            if (e.code === 'KeyN') {
                e.preventDefault();
                this.setCameraMode('downView');
                this.updateMobileCameraButtons('mobile-down-view');
            }
            
            if (e.code === 'KeyF') {
                e.preventDefault();
                this.setCameraMode('frontView');
                this.updateMobileCameraButtons('mobile-front-view');
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

        // Help button
        const helpBtn = document.getElementById('help-btn');
        if (helpBtn) {
            helpBtn.addEventListener('click', () => {
                const instructionsOverlay = document.getElementById('instructions-overlay');
                if (instructionsOverlay) {
                    instructionsOverlay.style.display = 'flex';
                }
            });
        }

        // Close instructions
        const closeInstructions = document.getElementById('close-instructions');
        if (closeInstructions) {
            closeInstructions.addEventListener('click', () => {
                const instructionsOverlay = document.getElementById('instructions-overlay');
                if (instructionsOverlay) {
                    instructionsOverlay.style.display = 'none';
                }
            });
        }

        // Mobile camera controls
        const mobileCameraBtns = [
            'mobile-cockpit-view',
            'mobile-external-view', 
            'mobile-tower-view',
            'mobile-chase-view',
            'mobile-door-view',
            'mobile-down-view',
            'mobile-front-view'
        ];

        mobileCameraBtns.forEach(btnId => {
            const btn = document.getElementById(btnId);
            if (btn) {
                btn.addEventListener('click', () => {
                    // Update mobile camera buttons
                    this.updateMobileCameraButtons(btnId);
                    
                    // Set camera mode based on button
                    switch(btnId) {
                        case 'mobile-cockpit-view':
                            this.setCameraMode('cockpitView');
                            break;
                        case 'mobile-external-view':
                            this.setCameraMode('externalView');
                            break;
                        case 'mobile-tower-view':
                            this.setCameraMode('towerView');
                            break;
                        case 'mobile-chase-view':
                            this.setCameraMode('chaseView');
                            break;
                        case 'mobile-door-view':
                            this.setCameraMode('doorView');
                            break;
                        case 'mobile-down-view':
                            this.setCameraMode('downView');
                            break;
                        case 'mobile-front-view':
                            this.setCameraMode('frontView');
                            break;
                    }
                });
            }
        });

        // Mobile special controls
        const mobileAutopilot = document.getElementById('mobile-autopilot');
        if (mobileAutopilot) {
            mobileAutopilot.addEventListener('click', () => {
                this.systems.autopilot = !this.systems.autopilot;
                mobileAutopilot.classList.toggle('active');
            });
        }

        const mobileGps = document.getElementById('mobile-gps');
        if (mobileGps) {
            mobileGps.addEventListener('click', () => {
                this.systems.gps = !this.systems.gps;
                mobileGps.classList.toggle('active');
            });
        }

        const mobileEngine = document.getElementById('mobile-engine');
        if (mobileEngine) {
            mobileEngine.addEventListener('click', () => {
                this.systems.engineRunning = !this.systems.engineRunning;
                mobileEngine.classList.toggle('active');
            });
        }

        const mobileReset = document.getElementById('mobile-reset');
        if (mobileReset) {
            mobileReset.addEventListener('click', () => {
                this.resetPosition();
            });
        }

        // Mobile throttle controls
        const mobileThrottleUp = document.getElementById('mobile-throttle-up');
        if (mobileThrottleUp) {
            mobileThrottleUp.addEventListener('click', () => {
                this.flightData.throttle = Math.min(this.flightData.throttle + 10, 100);
            });
        }

        const mobileThrottleDown = document.getElementById('mobile-throttle-down');
        if (mobileThrottleDown) {
            mobileThrottleDown.addEventListener('click', () => {
                this.flightData.throttle = Math.max(this.flightData.throttle - 10, 0);
            });
        }

        // Mobile gear and flaps
        const mobileGear = document.getElementById('mobile-gear');
        if (mobileGear) {
            mobileGear.addEventListener('click', () => {
                this.systems.landingGear = !this.systems.landingGear;
                mobileGear.classList.toggle('active');
            });
        }

        const mobileFlaps = document.getElementById('mobile-flaps');
        if (mobileFlaps) {
            mobileFlaps.addEventListener('click', () => {
                this.systems.flaps = !this.systems.flaps;
                mobileFlaps.classList.toggle('active');
            });
        }
        
        // FlightGear-style ATC controls
        const atcToggle = document.getElementById('atcToggle');
        if (atcToggle) {
            atcToggle.addEventListener('click', () => {
                this.systems.atc = !this.systems.atc;
                atcToggle.innerHTML = this.systems.atc ? 
                    '<i class="fas fa-microphone"></i> ATC OFF' : 
                    '<i class="fas fa-microphone"></i> ATC ON';
                atcToggle.classList.toggle('active');
            });
        }
        
        const transponderToggle = document.getElementById('transponderToggle');
        if (transponderToggle) {
            transponderToggle.addEventListener('click', () => {
                this.systems.transponder = !this.systems.transponder;
                transponderToggle.innerHTML = this.systems.transponder ? 
                    '<i class="fas fa-broadcast-tower"></i> XPDR OFF' : 
                    '<i class="fas fa-broadcast-tower"></i> XPDR ON';
                transponderToggle.classList.toggle('active');
            });
        }
        
        // ATC frequency slider
        const atcSlider = document.getElementById('atcSlider');
        if (atcSlider) {
            atcSlider.addEventListener('input', (e) => {
                this.atc.frequency = parseFloat(e.target.value);
                document.getElementById('atc-frequency').textContent = this.atc.frequency.toFixed(1);
            });
        }
        
        // Transponder code slider
        const transponderSlider = document.getElementById('transponderSlider');
        if (transponderSlider) {
            transponderSlider.addEventListener('input', (e) => {
                this.atc.squawk = parseInt(e.target.value);
                document.getElementById('transponder-code').textContent = this.atc.squawk.toString().padStart(4, '0');
            });
        }
        
        // Weather detail sliders
        const visibilitySlider = document.getElementById('visibilitySlider');
        if (visibilitySlider) {
            visibilitySlider.addEventListener('input', (e) => {
                this.weather.visibility = parseInt(e.target.value);
                document.getElementById('visibility-display').textContent = this.weather.visibility;
            });
        }
        
        const windSpeedSlider = document.getElementById('windSpeedSlider');
        if (windSpeedSlider) {
            windSpeedSlider.addEventListener('input', (e) => {
                this.weather.windSpeed = parseInt(e.target.value);
                document.getElementById('wind-speed-display').textContent = this.weather.windSpeed;
            });
        }
        
        const windDirectionSlider = document.getElementById('windDirectionSlider');
        if (windDirectionSlider) {
            windDirectionSlider.addEventListener('input', (e) => {
                this.weather.windDirection = parseInt(e.target.value);
                document.getElementById('wind-direction-display').textContent = this.weather.windDirection;
            });
        }
        
        // ATC display controls
        const atcDisplay = document.getElementById('atc-display');
        const atcClose = document.getElementById('atc-close');
        if (atcClose) {
            atcClose.addEventListener('click', () => {
                atcDisplay.style.display = 'none';
            });
        }
        
        // Show ATC display when ATC is enabled
        if (atcToggle) {
            atcToggle.addEventListener('click', () => {
                if (this.systems.atc) {
                    atcDisplay.style.display = 'block';
                } else {
                    atcDisplay.style.display = 'none';
                }
            });
        }
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
        if (!this.clock) return;
        
        const delta = this.clock.getDelta();
        
        // FlightGear-style physics calculations
        const airDensity = this.calculateAirDensity();
        const dynamicPressure = 0.5 * airDensity * this.flightData.speed * this.flightData.speed;
        
        // Calculate aerodynamic forces
        this.flightData.lift = this.calculateLift(dynamicPressure);
        this.flightData.drag = this.calculateDrag(dynamicPressure);
        this.flightData.thrust = this.calculateThrust();
        
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

        // Calculate speed based on throttle and physics
        if (this.systems.engineRunning) {
            const netForce = this.flightData.thrust - this.flightData.drag;
            const acceleration = netForce / this.flightData.weight;
            this.flightData.speed += acceleration * delta;
        }
        
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

        // Calculate true airspeed and ground speed
        this.flightData.trueAirspeed = this.flightData.speed * Math.sqrt(airDensity / 1.225);
        this.flightData.groundSpeed = this.flightData.trueAirspeed + this.weather.windSpeed * Math.cos((this.weather.windDirection - this.flightData.heading) * Math.PI / 180);
        
        // Calculate Mach number
        this.flightData.mach = this.flightData.trueAirspeed / 661.5; // Speed of sound at sea level
        
        // Calculate angle of attack
        this.flightData.angleOfAttack = Math.atan2(this.plane.velocity.y, Math.sqrt(this.plane.velocity.x * this.plane.velocity.x + this.plane.velocity.z * this.plane.velocity.z)) * 180 / Math.PI;
        
        // Calculate G-force
        const acceleration = Math.sqrt(
            this.plane.acceleration.x * this.plane.acceleration.x +
            this.plane.acceleration.y * this.plane.acceleration.y +
            this.plane.acceleration.z * this.plane.acceleration.z
        );
        this.flightData.gForce = 1 + acceleration / 9.81;

        // Update coordinates
        this.flightData.latitude = this.plane.position.x / 111000;
        this.flightData.longitude = this.plane.position.z / 111000;

        // Update fuel consumption
        if (this.flightData.throttle > 0) {
            this.flightData.fuel -= 0.01 * delta;
            if (this.flightData.fuel < 0) this.flightData.fuel = 0;
        }
        
        // Update weight (fuel consumption)
        this.flightData.weight = this.aircraftData.weight - (100 - this.flightData.fuel) * this.aircraftData.fuelCapacity / 100;

        // Update HUD
        this.updateHUD();
        
        // Update camera
        this.updateCamera();
    }
    
    calculateAirDensity() {
        // Calculate air density based on altitude and temperature
        const altitude = this.flightData.altitude;
        const temperature = this.weather.temperature - (altitude / 1000) * 6.5; // Temperature lapse rate
        const pressure = this.weather.pressure * Math.exp(-altitude / 8000);
        return pressure / (287.1 * (temperature + 273.15));
    }
    
    calculateLift(dynamicPressure) {
        const angleOfAttack = this.flightData.angleOfAttack * Math.PI / 180;
        const liftCoefficient = this.aircraftData.liftCoefficient * Math.sin(angleOfAttack);
        return liftCoefficient * this.aircraftData.wingArea * dynamicPressure;
    }
    
    calculateDrag(dynamicPressure) {
        const angleOfAttack = this.flightData.angleOfAttack * Math.PI / 180;
        const dragCoefficient = this.aircraftData.dragCoefficient + 0.1 * Math.sin(angleOfAttack) * Math.sin(angleOfAttack);
        return dragCoefficient * this.aircraftData.wingArea * dynamicPressure;
    }
    
    calculateThrust() {
        if (!this.systems.engineRunning) return 0;
        return this.aircraftData.thrust * (this.flightData.throttle / 100);
    }

    updateHUD() {
        try {
            // Update basic HUD values
            document.getElementById('speed').textContent = Math.round(this.flightData.speed);
            document.getElementById('altitude').textContent = Math.round(this.flightData.altitude);
            document.getElementById('heading').textContent = Math.round(this.flightData.heading);
            document.getElementById('airspeed').textContent = Math.round(this.flightData.airspeed);
            document.getElementById('fuel').textContent = Math.round(this.flightData.fuel);
            document.getElementById('latitude').textContent = this.flightData.latitude.toFixed(3);
            document.getElementById('longitude').textContent = this.flightData.longitude.toFixed(3);
            
            // FlightGear-style advanced instruments
            const trueAirspeedElement = document.getElementById('true-airspeed');
            if (trueAirspeedElement) {
                trueAirspeedElement.textContent = Math.round(this.flightData.trueAirspeed);
            }
            
            const groundSpeedElement = document.getElementById('ground-speed');
            if (groundSpeedElement) {
                groundSpeedElement.textContent = Math.round(this.flightData.groundSpeed);
            }
            
            const machElement = document.getElementById('mach');
            if (machElement) {
                machElement.textContent = this.flightData.mach.toFixed(2);
            }
            
            const gForceElement = document.getElementById('g-force');
            if (gForceElement) {
                gForceElement.textContent = this.flightData.gForce.toFixed(1);
            }
            
            const angleOfAttackElement = document.getElementById('angle-of-attack');
            if (angleOfAttackElement) {
                angleOfAttackElement.textContent = this.flightData.angleOfAttack.toFixed(1);
            }
            
            // Weather information
            const visibilityElement = document.getElementById('visibility');
            if (visibilityElement) {
                visibilityElement.textContent = this.weather.visibility + ' km';
            }
            
            const windElement = document.getElementById('wind');
            if (windElement) {
                windElement.textContent = `${this.weather.windSpeed} kt ${this.weather.windDirection}°`;
            }
            
            const temperatureElement = document.getElementById('temperature');
            if (temperatureElement) {
                temperatureElement.textContent = this.weather.temperature.toFixed(1) + '°C';
            }
            
            const pressureElement = document.getElementById('pressure');
            if (pressureElement) {
                pressureElement.textContent = this.weather.pressure.toFixed(2) + ' inHg';
            }
            
            // Navigation information
            const gpsSatellitesElement = document.getElementById('gps-satellites');
            if (gpsSatellitesElement) {
                gpsSatellitesElement.textContent = this.navigation.gps.satellites;
            }
            
            const gpsAccuracyElement = document.getElementById('gps-accuracy');
            if (gpsAccuracyElement) {
                gpsAccuracyElement.textContent = this.navigation.gps.accuracy + ' m';
            }
            
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
                
            // Update navigation
            this.updateNavigation();
            
            // Update ATC if enabled
            if (this.systems.atc) {
                this.contactATC();
            }
        } catch (error) {
            console.error('Error updating HUD:', error);
        }
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
                
            case this.cameraModes.DOOR:
                // Door view - from passenger door
                const doorOffset = new THREE.Vector3(15, 5, 0);
                doorOffset.applyQuaternion(this.plane.quaternion);
                this.camera.position.copy(this.plane.position).add(doorOffset);
                this.camera.lookAt(this.plane.position);
                break;
                
            case this.cameraModes.DOWN:
                // Down view - looking straight down
                const downOffset = new THREE.Vector3(0, 100, 0);
                this.camera.position.copy(this.plane.position).add(downOffset);
                this.camera.lookAt(this.plane.position);
                break;
                
            case this.cameraModes.FRONT:
                // Front view - looking ahead from nose
                const frontOffset = new THREE.Vector3(-20, 0, 0);
                frontOffset.applyQuaternion(this.plane.quaternion);
                this.camera.position.copy(this.plane.position).add(frontOffset);
                this.camera.lookAt(this.plane.position.clone().add(
                    new THREE.Vector3(-50, 0, 0).applyQuaternion(this.plane.quaternion)
                ));
                break;
        }
    }

    updateWeather() {
        switch (this.systems.weather) {
            case 'clear':
                this.scene.fog = new THREE.Fog(0x87CEEB, 1000, 20000);
                this.weather.visibility = 10;
                this.weather.ceiling = 3000;
                this.weather.turbulence = 0;
                break;
            case 'cloudy':
                this.scene.fog = new THREE.Fog(0xCCCCCC, 500, 10000);
                this.weather.visibility = 5;
                this.weather.ceiling = 1500;
                this.weather.turbulence = 1;
                break;
            case 'stormy':
                this.scene.fog = new THREE.Fog(0x666666, 200, 5000);
                this.weather.visibility = 2;
                this.weather.ceiling = 500;
                this.weather.turbulence = 3;
                this.weather.thunderstorms = true;
                break;
            case 'foggy':
                this.scene.fog = new THREE.Fog(0xDDDDDD, 100, 2000);
                this.weather.visibility = 1;
                this.weather.ceiling = 200;
                this.weather.turbulence = 0;
                break;
        }
        
        // Update wind effects
        this.weather.windSpeed = 5 + Math.sin(Date.now() * 0.0001) * 3;
        this.weather.windDirection = 270 + Math.sin(Date.now() * 0.00005) * 30;
        
        // Update temperature based on altitude
        this.weather.temperature = 15 - (this.flightData.altitude / 1000) * 6.5;
        
        // Update pressure based on altitude
        this.weather.pressure = 29.92 * Math.exp(-this.flightData.altitude / 8000);
    }
    
    // FlightGear-style ATC communication
    contactATC() {
        if (!this.systems.atc) return;
        
        const clearance = {
            callsign: this.atc.callsign,
            altitude: Math.round(this.flightData.altitude / 100) * 100,
            heading: Math.round(this.flightData.heading / 10) * 10,
            speed: Math.round(this.flightData.speed / 10) * 10
        };
        
        this.atc.clearance = clearance;
        this.atc.instructions.push(`Cleared to ${clearance.altitude} feet, heading ${clearance.heading}, speed ${clearance.speed} knots`);
        
        // Update ATC display
        this.updateATCDisplay();
    }
    
    updateATCDisplay() {
        const atcDisplay = document.getElementById('atc-display');
        if (atcDisplay && this.atc.clearance) {
            atcDisplay.innerHTML = `
                <h3>ATC Communication</h3>
                <p><strong>Callsign:</strong> ${this.atc.callsign}</p>
                <p><strong>Squawk:</strong> ${this.atc.squawk}</p>
                <p><strong>Frequency:</strong> ${this.atc.frequency} MHz</p>
                <p><strong>Cleared Altitude:</strong> ${this.atc.clearance.altitude} feet</p>
                <p><strong>Cleared Heading:</strong> ${this.atc.clearance.heading}°</p>
                <p><strong>Cleared Speed:</strong> ${this.atc.clearance.speed} knots</p>
            `;
        }
    }
    
    // FlightGear-style navigation
    updateNavigation() {
        // Update GPS
        this.navigation.gps.satellites = 8 + Math.floor(Math.random() * 4);
        this.navigation.gps.accuracy = 3 + Math.random() * 2;
        
        // Update VOR stations
        if (this.navigation.vor.length === 0) {
            this.navigation.vor = [
                { id: 'VOR1', frequency: 108.1, lat: 0, lon: 0, range: 50 },
                { id: 'VOR2', frequency: 112.3, lat: 10, lon: 10, range: 50 },
                { id: 'VOR3', frequency: 115.7, lat: -10, lon: -10, range: 50 }
            ];
        }
        
        // Update ILS systems
        if (this.navigation.ils.length === 0) {
            this.navigation.ils = [
                { id: 'ILS1', frequency: 109.1, lat: 0, lon: 0, course: 270 },
                { id: 'ILS2', frequency: 111.3, lat: 10, lon: 10, course: 90 }
            ];
        }
        
        // Update NDB stations
        if (this.navigation.ndb.length === 0) {
            this.navigation.ndb = [
                { id: 'NDB1', frequency: 350, lat: 5, lon: 5, range: 30 },
                { id: 'NDB2', frequency: 380, lat: -5, lon: -5, range: 30 }
            ];
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
        try {
            requestAnimationFrame(() => this.animate());
            
            this.updateFlightData();
            this.updatePerformance();
            
            this.renderer.render(this.scene, this.camera);
        } catch (error) {
            console.error('Error in animation loop:', error);
        }
    }
}



// Initialize the simulator when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new CompleteFlightSimulator();
});
