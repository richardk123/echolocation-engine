import screen_shader from "./../shaders/screen_shader.wgsl"
import { Renderer } from "./data/renderer";
import { RendererData } from "./data/renderer_data";
import { ScreenTextureData } from "./data/screen_texture_data";
import {Scene} from "./data/scene";

export class ScreenRenderer implements Renderer
{
    rendererData: RendererData;
    private scene: Scene;

    // Assets
    sampler: GPUSampler;
    screen_texture_data: ScreenTextureData;
    line_buffer: GPUBuffer;
    scene_parameters: GPUBuffer;

    // Pipeline objects
    screen_pipeline: GPURenderPipeline;
    screen_bind_group: GPUBindGroup;

    constructor(rendererData: RendererData, scene: Scene, screen_texture_data: ScreenTextureData)
    {
        this.rendererData = rendererData;
        this.scene = scene;
        this.screen_texture_data = screen_texture_data;

        this.createAssets();
        this.makePipeline();
    }

    private createAssets()
    {
        const samplerDescriptor: GPUSamplerDescriptor = {
            addressModeU: "repeat",
            addressModeV: "repeat",
            magFilter: "linear",
            minFilter: "nearest",
            mipmapFilter: "nearest",
            maxAnisotropy: 1
        };

        this.sampler = this.rendererData.device.createSampler(samplerDescriptor);

        const linesBufferDescriptor: GPUBufferDescriptor = {
            size: 16 * this.scene.alwaysVisibleLines.length,
            usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST
        };

        this.line_buffer = this.rendererData.device.createBuffer(linesBufferDescriptor);

        const sceneParameterBufferDescriptor: GPUBufferDescriptor = {
            size: 32,
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
        };
        this.scene_parameters = this.rendererData.device.createBuffer(
            sceneParameterBufferDescriptor
        );
    }

    private makePipeline() 
    {
        const screen_bind_group_layout = this.rendererData.device.createBindGroupLayout({
            entries: [
                {
                    binding: 0,
                    visibility: GPUShaderStage.FRAGMENT,
                    sampler: {}
                },
                {
                    binding: 1,
                    visibility: GPUShaderStage.FRAGMENT,
                    texture: {}
                },
                {
                    binding: 2,
                    visibility: GPUShaderStage.FRAGMENT,
                    buffer: {
                        type: "read-only-storage",
                        hasDynamicOffset: false
                    }
                },
                {
                    binding: 3,
                    visibility: GPUShaderStage.FRAGMENT,
                    buffer: {
                        type: "uniform",
                    }
                },
            ]

        });

        this.screen_bind_group = this.rendererData.device.createBindGroup({
            layout: screen_bind_group_layout,
            entries: [
                {
                    binding: 0,
                    resource:  this.sampler
                },
                {
                    binding: 1,
                    resource: this.screen_texture_data.color_buffer_view
                },
                {
                    binding: 2,
                    resource: {
                        buffer: this.line_buffer
                    }
                },
                {
                    binding: 3,
                    resource: {
                        buffer: this.scene_parameters,
                    }
                },
            ]
        });

        const screen_pipeline_layout = this.rendererData.device.createPipelineLayout({
            bindGroupLayouts: [screen_bind_group_layout]
        });

        this.screen_pipeline = this.rendererData.device.createRenderPipeline({
            layout: screen_pipeline_layout,
            
            vertex: {
                module: this.rendererData.device.createShaderModule({
                code: screen_shader,
            }),
            entryPoint: 'vert_main',
            },

            fragment: {
                module: this.rendererData.device.createShaderModule({
                code: screen_shader,
            }),
            entryPoint: 'frag_main',
            targets: [
                {
                    format: "bgra8unorm"
                }
            ]
            },
            primitive: {
                topology: "triangle-list"
            }
        });
    }

    public render(commandEncoder : GPUCommandEncoder)
    {
        this.setLines();
        this.setSceneData();

        const textureView : GPUTextureView = this.rendererData.context.getCurrentTexture().createView();
        const renderpass : GPURenderPassEncoder = commandEncoder.beginRenderPass({
            colorAttachments: [{
                view: textureView,
                clearValue: {r: 0, g: 0, b: 0, a: 1.0},
                loadOp: "clear",
                storeOp: "store"
            }]
        });

        renderpass.setPipeline(this.screen_pipeline);
        renderpass.setBindGroup(0, this.screen_bind_group);
        renderpass.draw(6, 1, 0, 0);
        
        renderpass.end();
    }


    private setLines()
    {
        const dataCount = 4;
        const lineData: Float32Array = new Float32Array(dataCount * this.scene.alwaysVisibleLines.length);
        for (let i = 0; i < this.scene.alwaysVisibleLines.length; i++)
        {
            lineData[dataCount*i] = this.scene.alwaysVisibleLines[i].x0;
            lineData[dataCount*i + 1] = this.scene.alwaysVisibleLines[i].y0;
            lineData[dataCount*i + 2] = this.scene.alwaysVisibleLines[i].x1;
            lineData[dataCount*i + 3] = this.scene.alwaysVisibleLines[i].y1;
        }

        this.rendererData.device.queue.writeBuffer(this.line_buffer, 0, lineData, 0, dataCount * this.scene.alwaysVisibleLines.length);
    }

    private setSceneData()
    {
        this.rendererData.device.queue.writeBuffer(
            this.scene_parameters, 0,
            new Int32Array(
                [
                    this.scene.alwaysVisibleLines.length,
                    0,
                ]
            ), 0, 2
        )
    }
}