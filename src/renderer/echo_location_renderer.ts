import { Scene } from "../data/scene";
import raytracer_kernel from "./../shaders/raytracer_kernel.wgsl"
import { Renderer } from "./data/renderer";
import { RendererData } from "./data/renderer_data";
import { ScreenTextureData } from "./data/screen_texture_data";

export class EcholocationRenderer implements Renderer
{
    rendererData: RendererData;
    scene: Scene;

    //Assets
    screen_texture_data: ScreenTextureData;
    line_buffer: GPUBuffer;

    // Pipeline objects
    ray_tracing_pipeline: GPUComputePipeline;
    ray_tracing_bind_group: GPUBindGroup;


    constructor(renderer: RendererData, scene: Scene, screen_texture_data: ScreenTextureData)
    {
        this.rendererData = renderer;
        this.scene = scene;
        this.screen_texture_data = screen_texture_data;

        this.createAssets();
        this.makePipeline();
    }

    private createAssets()
    {
        const linesBufferDescriptor: GPUBufferDescriptor = {
            size: 16 * this.scene.lines.length,
            usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST
        };

        this.line_buffer = this.rendererData.device.createBuffer(linesBufferDescriptor);
    }

    private makePipeline()
    {
        const ray_tracing_bind_group_layout = this.rendererData.device.createBindGroupLayout({
            entries: [
                {
                    binding: 0,
                    visibility: GPUShaderStage.COMPUTE,
                    storageTexture: {
                        access: "write-only",
                        format: "rgba8unorm",
                        viewDimension: "2d"
                    }
                },
                {
                    binding: 1,
                    visibility: GPUShaderStage.COMPUTE,
                    buffer: {
                        type: "read-only-storage",
                        hasDynamicOffset: false
                    }
                }
            ]
        });
    
        this.ray_tracing_bind_group = this.rendererData.device.createBindGroup({
            layout: ray_tracing_bind_group_layout,
            entries: [
                {
                    binding: 0,
                    resource: this.screen_texture_data.color_buffer_view
                },
                {
                    binding: 1,
                    resource: {
                        buffer: this.line_buffer
                    }
                }
            ]
        });
        
        const ray_tracing_pipeline_layout = this.rendererData.device.createPipelineLayout({
            bindGroupLayouts: [ray_tracing_bind_group_layout]
        });

        this.ray_tracing_pipeline = this.rendererData.device.createComputePipeline({
            layout: ray_tracing_pipeline_layout,
            
            compute: {
                    module: this.rendererData.device.createShaderModule({
                    code: raytracer_kernel,
                }),
                entryPoint: 'main',
            },
        });
    }

    public render(commandEncoder : GPUCommandEncoder)
    {
        this.setLines();

        const ray_trace_pass : GPUComputePassEncoder = commandEncoder.beginComputePass();
        ray_trace_pass.setPipeline(this.ray_tracing_pipeline);
        ray_trace_pass.setBindGroup(0, this.ray_tracing_bind_group);
        ray_trace_pass.dispatchWorkgroups(this.scene.lines.length, 1, 1);
        ray_trace_pass.end();
    }

    setLines()
    {
        const lineData: Int32Array = new Int32Array(4 * this.scene.lines.length);
        for (let i = 0; i < this.scene.lines.length; i++) 
        {
            lineData[4*i] = this.scene.lines[i].x0;
            lineData[4*i + 1] = this.scene.lines[i].y0;
            lineData[4*i + 2] = this.scene.lines[i].x1;
            lineData[4*i + 3] = this.scene.lines[i].y1;
        }

        this.rendererData.device.queue.writeBuffer(this.line_buffer, 0, lineData, 0, 4 * this.scene.lines.length);
    }
}