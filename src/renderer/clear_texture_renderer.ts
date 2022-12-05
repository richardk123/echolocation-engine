import { Scene } from "../data/scene";
import clearTexture_kernel from "./../shaders/clear_texture_kernel.wgsl"
import { Renderer } from "./data/renderer";
import { RendererData } from "./data/renderer_data";
import { ScreenTextureData } from "./data/screen_texture_data";

export class ClearTextureRenderer implements Renderer, ScreenTextureData
{
    rendererData: RendererData;
    canvas: HTMLCanvasElement;
    scene: Scene;

    //Assets
    color_buffer: GPUTexture;
    color_buffer_view: GPUTextureView;
    line_buffer: GPUBuffer;
    scene_parameters: GPUBuffer;

    // Pipeline objects
    clear_texture_pipeline: GPUComputePipeline;
    clear_texture_bind_group: GPUBindGroup;


    constructor(renderer: RendererData, scene: Scene, canvas: HTMLCanvasElement)
    {
        this.rendererData = renderer;
        this.scene = scene;
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

        const linesBufferDescriptor: GPUBufferDescriptor = {
            size: 16 * this.scene.alwaysVisibleLines.length,
            usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST
        };

        this.line_buffer = this.rendererData.device.createBuffer(linesBufferDescriptor);

        const scaneParameterBufferDescriptor: GPUBufferDescriptor = {
            size: 32,
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
        };
        this.scene_parameters = this.rendererData.device.createBuffer(
            scaneParameterBufferDescriptor
        );
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
                },
                {
                    binding: 1,
                    visibility: GPUShaderStage.COMPUTE,
                    buffer: {
                        type: "read-only-storage",
                        hasDynamicOffset: false
                    }
                },
                {
                    binding: 2,
                    visibility: GPUShaderStage.COMPUTE,
                    buffer: {
                        type: "uniform",
                    }
                },
            ]
        });
    
        this.clear_texture_bind_group = this.rendererData.device.createBindGroup({
            layout: clear_texture_bind_group_layout,
            entries: [
                {
                    binding: 0,
                    resource: this.color_buffer_view
                },
                {
                    binding: 1,
                    resource: {
                        buffer: this.line_buffer
                    }
                },
                {
                    binding: 2,
                    resource: {
                        buffer: this.scene_parameters,
                    }
                },
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
        this.setLines();
        this.setSceneData();

        const ray_trace_pass : GPUComputePassEncoder = commandEncoder.beginComputePass();
        ray_trace_pass.setPipeline(this.clear_texture_pipeline);
        ray_trace_pass.setBindGroup(0, this.clear_texture_bind_group);
        ray_trace_pass.dispatchWorkgroups(this.canvas.width, this.canvas.height, 1);
        ray_trace_pass.end();
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