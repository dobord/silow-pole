# WebGPU Migration Guide

## Overview

This document describes the migration from WebGL to WebGPU for the Silow Pole project.

## Current Status (Iteration 7)

### Implemented
- ✅ Basic WebGPU renderer module (`webgpu-renderer.js`)
- ✅ Compute shader for potential field calculation
- ✅ Render pipeline for field visualization
- ✅ UI toggle for WebGPU mode
- ✅ Fallback to WebGL when WebGPU unavailable

### Architecture

```
┌─────────────────────────────────────┐
│       UI Layer (jQuery Mobile)      │
└─────────────────────────────────────┘
                 │
      ┌──────────┴──────────┐
      │                     │
┌─────▼──────┐     ┌───────▼────────┐
│  WebGL     │     │   WebGPU       │
│  Renderer  │     │   Renderer     │
└────────────┘     └────────────────┘
```

### WebGPU Compute Pipeline

The compute shader calculates the electric potential at each pixel:

```wgsl
@compute @workgroup_size(8, 8)
fn main(@builtin(global_invocation_id) global_id: vec3<u32>) {
    // Calculate pixel position
    let pos = vec2<f32>(x, y);
    
    // Sum contributions from all charges
    for each charge {
        phi += q / distance(pos, charge.pos)
    }
    
    // Store in output buffer
    output[idx] = phi;
}
```

### WebGPU Render Pipeline

The render pipeline visualizes the computed field with color mapping:

```wgsl
@fragment
fn main(@location(0) texCoord: vec2<f32>) -> @location(0) vec4<f32> {
    let phi = textureSample(potentialTexture, textureSampler, texCoord).r;
    return applyColorPalette(phi);
}
```

## Benefits of WebGPU

1. **Performance**: GPU compute shaders for field calculation
2. **Modern API**: Better resource management
3. **Cross-platform**: Unified API across devices
4. **Future-proof**: Industry standard going forward

## Browser Support

- Chrome 113+ (stable)
- Edge 113+ (stable)
- Safari 18+ (experimental)
- Firefox (in development)

## TODO

### Short-term
- [ ] Implement buffer management for charges
- [ ] Add bind group creation
- [ ] Complete render pass setup
- [ ] Test on multiple browsers

### Medium-term
- [ ] Optimize compute workgroup size
- [ ] Add GPU timing/profiling
- [ ] Implement all color palettes in WebGPU
- [ ] Add equipotential lines in compute shader

### Long-term
- [ ] Remove WebGL code path
- [ ] Add advanced compute features
- [ ] 3D field visualization
- [ ] Real-time charge animation

## Migration Strategy

1. **Phase 1** (Current): Parallel implementation
   - Both WebGL and WebGPU available
   - User can switch between them
   - Test and validate WebGPU

2. **Phase 2**: Feature parity
   - All WebGL features in WebGPU
   - Performance optimization
   - Extensive testing

3. **Phase 3**: WebGPU primary
   - WebGPU as default
   - WebGL as fallback
   - Deprecation notice

4. **Phase 4**: WebGPU only
   - Remove WebGL code
   - Simplified codebase
   - WebGPU-specific optimizations

## Performance Comparison

| Feature | WebGL | WebGPU | Improvement |
|---------|-------|--------|-------------|
| Field calculation | Fragment shader | Compute shader | ~2x faster |
| Memory usage | Textures only | Storage buffers | More flexible |
| CPU overhead | High | Low | ~3x reduction |

## Testing Checklist

- [ ] Field rendering matches WebGL
- [ ] Color palettes work correctly
- [ ] Equipotentials display properly
- [ ] Field lines traced correctly
- [ ] Performance meets targets
- [ ] Works on all supported browsers
- [ ] Handles errors gracefully

## References

- [WebGPU Specification](https://www.w3.org/TR/webgpu/)
- [WebGPU Shading Language (WGSL)](https://www.w3.org/TR/WGSL/)
- [GPU for the Web Community Group](https://www.w3.org/community/gpu/)
- [WebGPU Samples](https://webgpu.github.io/webgpu-samples/)

---

**Last Updated**: 2025-10-04  
**Author**: Кашин Михаил (dobordx@gmail.com)
