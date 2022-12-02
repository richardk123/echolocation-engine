import { Scene } from "../data/scene";
import clearTexture_kernel from "./../shaders/clear_texture_kernel.wgsl"
import { Renderer } from "./data/renderer";
import { RendererData } from "./data/renderer_data";
import { ScreenTextureData } from "./data/screen_texture_data";

export class ClearTextureRenderer implements Renderer, ScreenTextureData
{
    rendererData: RendererData;
    canvas: HTMLCanvasElement;

    //Assets
    color_buffer: GPUTexture;
    color_buffer_view: GPUTextureView;

    // Pipeline objects
    clear_texture_pipeline: GPUComputePipeline;
    clear_texture_bind_group: GPUBindGroup;


    constructor(renderer: RendererData, canvas: HTMLCanvasElement)
    {
        this.rendererData = renderer;
        this.canvas = canvas;

        this.createAssets();
        this.makePipeline();
    }

    private createAssets()
    {
        this.color_buffer = this.rendererData.device.createTexture(
            {
                size: {
                    width: this.rendererData.canvas.width,
                    height: this.rendererData.canvas.height,
                },
                format: "rgba8unorm",
                usage: GPUTextureUsage.COPY_DST | GPUTextureUsage.STORAGE_BINDING | GPUTextureUsage.TEXTURE_BINDING
            }
        );

        this.color_buffer_view = this.color_buffer.createView();
    }

    private makePipeline()
    {
        const clear_texture_bind_group_layout = this.rendererData.device.createBindGroupLayout({
            entries: [
                {
                    binding: 0,
                    visibility: GPUShaderStage.COMPUTE,
                    storageTexture: {
                        access: "write-only",
                        format: "rgba8unorm",
                        viewDimension: "2d"
                    }
                }
            ]
        });
    
        this.clear_texture_bind_group = this.rendererData.device.createBindGroup({
            layout: clear_texture_bind_group_layout,
            entries: [
                {
                    binding: 0,
                    resource: this.color_buffer_view
                }
            ]
        });
        
        const clear_texture_pipeline_layout = this.rendererData.device.createPipelineLayout({
            bindGroupLayouts: [clear_texture_bind_group_layout]
        });

        this.clear_texture_pipeline = this.rendererData.device.createComputePipeline({
            layout: clear_texture_pipeline_layout,
            
            compute: {
                    module: this.rendererData.device.createShaderModule({
                    code: clearTexture_kernel,
                }),
                entryPoint: 'main',
            },
        });
    }

    public render(commandEncoder : GPUCommandEncoder)
    {
        const ray_trace_pass : GPUComputePassEncoder = commandEncoder.beginComputePass();
        ray_trace_pass.setPipeline(this.clear_texture_pipeline);
        ray_trace_pass.setBindGroup(0, this.clear_texture_bind_group);
        ray_trace_pass.dispatchWorkgroups(this.canvas.width, this.canvas.height, 1);
        ray_trace_pass.end();
    }
}