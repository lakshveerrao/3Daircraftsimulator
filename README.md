# 3D Plane Simulator

A realistic 3D plane simulator built with Three.js that allows you to control an aircraft in a 3D environment with terrain, clouds, and realistic physics.

## Features

- **Realistic 3D Aircraft Model**: Detailed plane with fuselage, wings, tail, propeller, and landing gear
- **Interactive Controls**: Adjust speed, altitude, pitch, roll, and yaw using sliders
- **Keyboard Controls**: Use WASD keys for manual flight control
- **Auto-Pilot Mode**: Toggle automatic flight with realistic flight patterns
- **3D Environment**: 
  - Vast terrain with mountains
  - Dynamic cloud system
  - Realistic sky and lighting
  - Atmospheric fog effects
- **Camera System**: Third-person camera that follows the aircraft
- **Responsive Design**: Works on desktop and mobile devices

## Controls

### Slider Controls
- **Speed**: 0-800 km/h
- **Altitude**: 0-10,000 meters
- **Pitch**: -45° to +45° (nose up/down)
- **Roll**: -45° to +45° (banking left/right)
- **Yaw**: -180° to +180° (turning left/right)

### Keyboard Controls
- **W/S**: Pitch up/down
- **A/D**: Roll left/right
- **Space**: Toggle auto-pilot mode
- **R**: Reset aircraft position

### Mouse Controls
- **Mouse Movement**: Look around the environment

## How to Run

1. **Simple Setup**: Just open `index.html` in a modern web browser
2. **Local Server** (Recommended): 
   ```bash
   # Using Python
   python -m http.server 8000
   
   # Using Node.js
   npx serve .
   
   # Using PHP
   php -S localhost:8000
   ```
   Then visit `http://localhost:8000`

## Technical Details

### Technologies Used
- **Three.js**: 3D graphics library
- **HTML5**: Structure and UI
- **CSS3**: Styling and responsive design
- **JavaScript**: Game logic and controls

### Key Components

#### Aircraft Model
- Fuselage: Cylindrical body
- Wings: Main lifting surfaces
- Tail: Vertical and horizontal stabilizers
- Propeller: Engine representation
- Landing Gear: Retractable gear system

#### Environment
- **Terrain**: Large plane with mountains
- **Sky**: Spherical skybox
- **Clouds**: Procedurally generated cloud formations
- **Lighting**: Directional sunlight with shadows

#### Physics System
- Realistic flight dynamics
- Speed-based movement
- Altitude control
- Angular rotation (pitch, roll, yaw)

## Browser Compatibility

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## Performance

The simulator is optimized for smooth 60 FPS performance on modern devices. Features include:
- Efficient 3D rendering
- Optimized geometry
- Level-of-detail system
- Responsive controls

## Customization

You can easily modify the simulator by editing the JavaScript file:

- **Aircraft Model**: Modify `createPlane()` method
- **Environment**: Adjust `createTerrain()` and `createClouds()`
- **Controls**: Customize `setupControls()` and `setupEventListeners()`
- **Physics**: Modify `updatePlane()` method

## Future Enhancements

Potential improvements:
- More detailed aircraft models
- Weather effects (rain, snow, wind)
- Multiple aircraft types
- Multiplayer support
- Flight instruments and HUD
- Sound effects
- More detailed terrain with cities and landmarks

## License

This project is open source and available under the MIT License.

## Contributing

Feel free to contribute by:
- Reporting bugs
- Suggesting new features
- Submitting pull requests
- Improving documentation

---

**Enjoy flying!** ✈️
