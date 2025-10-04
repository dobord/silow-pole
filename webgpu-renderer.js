/**
 * WebGPU Renderer Module for Silow Pole
 * @author Кашин Михаил (dobordx@gmail.com)
 * @version 1.0.0
 * @date 2025-10-04
 */

class WebGPURenderer {
    constructor(canvas) {
        this.canvas = canvas;
        this.device = null;
        this.context = null;
        this.pipeline = null;
        this.bindGroup = null;
        this.initialized = false;
    }

    /**
     * Проверка поддержки WebGPU
     */
    static isSupported() {
        return 'gpu' in navigator;
    }

    /**
     * Инициализация WebGPU
     */
    async init() {
        if (!WebGPURenderer.isSupported()) {
            throw new Error('WebGPU is not supported in this browser');
        }

        // Запрос адаптера
        const adapter = await navigator.gpu.requestAdapter();
        if (!adapter) {
            throw new Error('Failed to get GPU adapter');
        }

        // Запрос устройства
        this.device = await adapter.requestDevice();
        
        // Настройка контекста
        this.context = this.canvas.getContext('webgpu');
        const format = navigator.gpu.getPreferredCanvasFormat();
        
        this.context.configure({
            device: this.device,
            format: format,
            alphaMode: 'opaque',
        });

        console.log('WebGPU initialized successfully');
        this.initialized = true;
        
        return true;
    }

    /**
     * Создание compute pipeline для вычисления потенциала
     */
    async createComputePipeline(charges) {
        const computeShader = `
            struct Charge {
                pos: vec2<f32>,
                q: f32,
                aux: f32,
            }
            
            struct Uniforms {
                width: u32,
                height: u32,
                numCharges: u32,
                padding: u32,
            }
            
            @group(0) @binding(0) var<storage, read> charges: array<Charge>;
            @group(0) @binding(1) var<uniform> uniforms: Uniforms;
            @group(0) @binding(2) var<storage, read_write> output: array<f32>;
            
            @compute @workgroup_size(8, 8)
            fn main(@builtin(global_invocation_id) global_id: vec3<u32>) {
                let x = global_id.x;
                let y = global_id.y;
                
                if (x >= uniforms.width || y >= uniforms.height) {
                    return;
                }
                
                let pos = vec2<f32>(
                    f32(x) - f32(uniforms.width) / 2.0,
                    f32(y) - f32(uniforms.height) / 2.0
                );
                
                var phi: f32 = 0.0;
                
                for (var i: u32 = 0u; i < uniforms.numCharges; i = i + 1u) {
                    let charge = charges[i];
                    let dist = distance(pos, charge.pos);
                    if (dist > 0.01) {
                        phi = phi + charge.q / dist;
                    }
                }
                
                let idx = y * uniforms.width + x;
                output[idx] = phi;
            }
        `;

        const shaderModule = this.device.createShaderModule({
            code: computeShader,
        });

        this.computePipeline = this.device.createComputePipeline({
            layout: 'auto',
            compute: {
                module: shaderModule,
                entryPoint: 'main',
            },
        });

        console.log('Compute pipeline created');
    }

    /**
     * Создание render pipeline для визуализации
     */
    async createRenderPipeline() {
        const vertexShader = `
            struct VertexOutput {
                @builtin(position) position: vec4<f32>,
                @location(0) texCoord: vec2<f32>,
            }
            
            @vertex
            fn main(@builtin(vertex_index) vertexIndex: u32) -> VertexOutput {
                var pos = array<vec2<f32>, 6>(
                    vec2<f32>(-1.0, -1.0),
                    vec2<f32>(1.0, -1.0),
                    vec2<f32>(1.0, 1.0),
                    vec2<f32>(-1.0, -1.0),
                    vec2<f32>(1.0, 1.0),
                    vec2<f32>(-1.0, 1.0)
                );
                
                var texCoord = array<vec2<f32>, 6>(
                    vec2<f32>(0.0, 1.0),
                    vec2<f32>(1.0, 1.0),
                    vec2<f32>(1.0, 0.0),
                    vec2<f32>(0.0, 1.0),
                    vec2<f32>(1.0, 0.0),
                    vec2<f32>(0.0, 0.0)
                );
                
                var output: VertexOutput;
                output.position = vec4<f32>(pos[vertexIndex], 0.0, 1.0);
                output.texCoord = texCoord[vertexIndex];
                return output;
            }
        `;

        const fragmentShader = `
            @group(0) @binding(0) var potentialTexture: texture_2d<f32>;
            @group(0) @binding(1) var textureSampler: sampler;
            
            struct Uniforms {
                compression: f32,
                palette: u32,
                padding1: u32,
                padding2: u32,
            }
            
            @group(0) @binding(2) var<uniform> uniforms: Uniforms;
            
            fn palette_classic(phi: f32) -> vec4<f32> {
                var compressed = sign(phi) * pow(abs(phi), uniforms.compression);
                var color: vec4<f32>;
                
                if (compressed > 0.0) {
                    if (compressed > 1.0) {
                        color = vec4<f32>(1.0, 1.0 - 1.0/compressed, 0.0, 1.0);
                    } else {
                        color = vec4<f32>(compressed, 0.0, 0.0, 1.0);
                    }
                } else {
                    if (compressed < -1.0) {
                        color = vec4<f32>(0.0, 1.0 + 1.0/compressed, 1.0, 1.0);
                    } else {
                        color = vec4<f32>(0.0, 0.0, -compressed, 1.0);
                    }
                }
                
                return color;
            }
            
            @fragment
            fn main(@location(0) texCoord: vec2<f32>) -> @location(0) vec4<f32> {
                let phi = textureSample(potentialTexture, textureSampler, texCoord).r;
                let normalizedPhi = phi * 200.0 - 100.0;
                return palette_classic(normalizedPhi);
            }
        `;

        const vertexModule = this.device.createShaderModule({ code: vertexShader });
        const fragmentModule = this.device.createShaderModule({ code: fragmentShader });

        const format = navigator.gpu.getPreferredCanvasFormat();

        this.renderPipeline = this.device.createRenderPipeline({
            layout: 'auto',
            vertex: {
                module: vertexModule,
                entryPoint: 'main',
            },
            fragment: {
                module: fragmentModule,
                entryPoint: 'main',
                targets: [{
                    format: format,
                }],
            },
            primitive: {
                topology: 'triangle-list',
            },
        });

        console.log('Render pipeline created');
    }

    /**
     * Рендеринг кадра
     */
    render(charges, settings) {
        if (!this.initialized || !this.device) {
            console.error('WebGPU not initialized');
            return;
        }

        const commandEncoder = this.device.createCommandEncoder();
        
        const textureView = this.context.getCurrentTexture().createView();
        
        const renderPass = commandEncoder.beginRenderPass({
            colorAttachments: [{
                view: textureView,
                clearValue: { r: 0.0, g: 0.0, b: 0.0, a: 1.0 },
                loadOp: 'clear',
                storeOp: 'store',
            }],
        });

        // TODO: Настройка bind groups и draw calls
        
        renderPass.end();
        
        this.device.queue.submit([commandEncoder.finish()]);
    }

    /**
     * Очистка ресурсов
     */
    destroy() {
        if (this.device) {
            this.device.destroy();
            this.device = null;
        }
        this.initialized = false;
    }
}

// Экспорт для использования в модулях
if (typeof module !== 'undefined' && module.exports) {
    module.exports = WebGPURenderer;
}
