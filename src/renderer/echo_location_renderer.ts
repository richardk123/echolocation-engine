import { Scene } from "../data/scene";
import echo_location_kernel from "./../shaders/echo_location_kernel.wgsl"
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
    scene_parameters: GPUBuffer;

    // Pipeline objects
    echo_location_pipeline: GPUComputePipeline;
    echo_location_bind_group: GPUBindGroup;


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
            size: 24 * this.scene.lines.length,
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
        const echo_location_bind_group_layout = this.rendererData.device.createBindGroupLayout({
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
    
        this.echo_location_bind_group = this.rendererData.device.createBindGroup({
            layout: echo_location_bind_group_layout,
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
                },
                {
                    binding: 2,
                    resource: {
                        buffer: this.scene_parameters,
                    }
                },
            ]
        });
        
        const echo_location_pipeline_layout = this.rendererData.device.createPipelineLayout({
            bindGroupLayouts: [echo_location_bind_group_layout]
        });

        this.echo_location_pipeline = this.rendererData.device.createComputePipeline({
            layout: echo_location_pipeline_layout,
            
            compute: {
                    module: this.rendererData.device.createShaderModule({
                    code: echo_location_kernel,
                }),
                entryPoint: 'main',
            },
        });
    }

    public render(commandEncoder : GPUCommandEncoder)
    {
        this.setLines();
        this.setSceneData();

        const echo_location_pass : GPUComputePassEncoder = commandEncoder.beginComputePass();
        echo_location_pass.setPipeline(this.echo_location_pipeline);
        echo_location_pass.setBindGroup(0, this.echo_location_bind_group);
        
        const workerCount = this.rendererData.scene.rayCount;
        echo_location_pass.dispatchWorkgroups(workerCount, 1, 1);
        echo_location_pass.end();
    }

    private setLines()
    {
        const dataCount = 6;
        const lineData: Float32Array = new Float32Array(dataCount * this.scene.lines.length);
        for (let i = 0; i < this.scene.lines.length; i++) 
        {
            lineData[dataCount*i] = this.scene.lines[i].x0;
            lineData[dataCount*i + 1] = this.scene.lines[i].y0;
            lineData[dataCount*i + 2] = this.scene.lines[i].x1;
            lineData[dataCount*i + 3] = this.scene.lines[i].y1;
            lineData[dataCount*i + 4] = this.scene.lines[i].data[4];
            lineData[dataCount*i + 5] = 0;
        }

        this.rendererData.device.queue.writeBuffer(this.line_buffer, 0, lineData, 0, dataCount * this.scene.lines.length);
    }

    private setSceneData()
    {
        this.rendererData.device.queue.writeBuffer(
            this.scene_parameters, 0,
            new Int32Array(
                [
                    this.scene.playerPos[0],
                    this.scene.playerPos[1],
                    this.rendererData.canvas.width,
                    this.rendererData.canvas.height,
                    this.scene.rayCount,
                    this.scene.lines.length,
                    this.scene.reflectionCount,
                    0
                ]
            ), 0, 8
        )
    }
}