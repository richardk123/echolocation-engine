import screen_shader from "./../shaders/screen_shader.wgsl"
import { Renderer } from "./data/renderer";
import { RendererData } from "./data/renderer_data";

export class ScreenRenderer implements Renderer
{
    rendererData: RendererData;
    color_buffer_view: GPUTextureView;

    // Assets
    sampler: GPUSampler;

    // Pipeline objects
    screen_pipeline: GPURenderPipeline;
    screen_bind_group: GPUBindGroup;

    constructor(rendererData: RendererData, color_buffer_view: GPUTextureView)
    {
        this.rendererData = rendererData;
        this.color_buffer_view = color_buffer_view;

        const samplerDescriptor: GPUSamplerDescriptor = {
            addressModeU: "repeat",
            addressModeV: "repeat",
            magFilter: "linear",
            minFilter: "nearest",
            mipmapFilter: "nearest",
            maxAnisotropy: 1
        };

        this.sampler = this.rendererData.device.createSampler(samplerDescriptor);

        this.makePipeline();
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
                    resource: this.color_buffer_view
                }
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
}