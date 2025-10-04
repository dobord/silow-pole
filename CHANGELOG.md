# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.0.0-beta] - 2025-10-04

### Added - Major Feature Release

#### Iteration 1: Equipotential Levels Management
- Interactive UI panel for managing equipotential surfaces
- Ability to add equipotentials by numeric value
- List view with delete functionality for individual levels
- Real-time update of equipotential visualization

#### Iteration 2: Compression Settings
- Compression parameter in shader (0.1 - 2.0)
- UI slider for dynamic compression adjustment
- Visual display of current compression value
- Improved high-field visualization

#### Iteration 3: Color Palettes
- Multiple color schemes: Classic (Red-Blue), Heat, Cool, Rainbow
- Palette selection in settings panel
- Shader implementation for all palettes
- Smooth color interpolation

#### Iteration 4: Render-to-Texture Optimization
- RTT framework for field pre-computation
- Separate compute and display shaders
- Framebuffer and texture management
- Toggle switch for RTT mode
- Performance optimization for complex scenes

#### Iteration 5: Enhanced Field Lines
- Runge-Kutta 4th order (RK4) integration
- Adaptive step size based on field strength
- Improved accuracy near charges
- Smoother and more accurate field line visualization

#### Iteration 6: Scene Management
- Export scene to JSON format
- Import scene from JSON file
- Saves charges, equipotentials, and settings
- Timestamped export files
- Error handling for import

#### Iteration 7: WebGPU Foundation
- WebGPU renderer module (`webgpu-renderer.js`)
- Compute shader for potential field calculation
- Render pipeline for field visualization
- Dual-mode support (WebGL/WebGPU)
- Browser compatibility detection
- WebGPU migration documentation

#### Iteration 8: Documentation Updates
- Updated README with modern features
- Added CHANGELOG
- Comprehensive documentation for all new features
- WebGPU migration guide
- Status tracking for roadmap items

### Changed
- Enhanced shader architecture with multiple rendering paths
- Improved UI organization with popup panels
- Better separation of concerns in code structure
- Modern JavaScript async/await patterns

### Technical Improvements
- Storage buffer preparation for WebGPU
- Improved error handling throughout
- Better resource management
- Enhanced performance monitoring capabilities

## [1.0.0] - 2013-08-30

### Initial Release
- Basic electric field visualization
- Point charge manipulation
- Field line tracing (Euler method)
- WebGL 1.0 rendering
- jQuery Mobile UI
- Equipotential line visualization (basic)

---

## Version Numbering

- **Major version** (X.0.0): Breaking changes or complete rewrites
- **Minor version** (0.X.0): New features, backward compatible
- **Patch version** (0.0.X): Bug fixes, minor improvements

### Roadmap Versions

- **2.0.0**: Current feature/webgpu branch
- **2.1.0**: 3D visualization support (planned)
- **2.2.0**: Animation system (planned)
- **3.0.0**: WebGPU-only version (future)
