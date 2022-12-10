import { Scene } from "./data/scene";
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
    sound_source_buffer: GPUBuffer;

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
            size: 16 * this.scene.lines.length,
            usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST
        };

        this.line_buffer = this.rendererData.device.createBuffer(linesBufferDescriptor);

        const sceneParameterBufferDescriptor: GPUBufferDescriptor = {
            size: 16,
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
        };
        this.scene_parameters = this.rendererData.device.createBuffer(
            sceneParameterBufferDescriptor
        );

        const soundSourceBufferDescriptor: GPUBufferDescriptor = {
            size: 16 * this.scene.soundSources.length,
            usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST
        };

        this.sound_source_buffer = this.rendererData.device.createBuffer(soundSourceBufferDescriptor);
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
                        type: "read-only-storage",
                        hasDynamicOffset: false
                    }
                },
                {
                    binding: 3,
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
                        buffer: this.sound_source_buffer,
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
        this.setSoundSources();

        const echo_location_pass : GPUComputePassEncoder = commandEncoder.beginComputePass();
        echo_location_pass.setPipeline(this.echo_location_pipeline);
        echo_location_pass.setBindGroup(0, this.echo_location_bind_group);
        
        echo_location_pass.dispatchWorkgroups(800, 600, 1);
        echo_location_pass.end();
    }

    private setLines()
    {
        const dataCount = 4;
        const lineData: Float32Array = new Float32Array(dataCount * this.scene.lines.length);
        for (let i = 0; i < this.scene.lines.length; i++) 
        {
            lineData[dataCount * i + 0] = this.scene.lines[i].x0;
            lineData[dataCount * i + 1] = this.scene.lines[i].y0;
            lineData[dataCount * i + 2] = this.scene.lines[i].x1;
            lineData[dataCount * i + 3] = this.scene.lines[i].y1;
        }

        this.rendererData.device.queue.writeBuffer(this.line_buffer, 0, lineData, 0,
            dataCount * this.scene.lines.length);
    }

    private setSoundSources()
    {
        const dataCount = 4;
        const soundSourceData: Float32Array = new Float32Array(dataCount * this.scene.soundSources.length);
        for (let i = 0; i < this.scene.soundSources.length; i++)
        {
            soundSourceData[dataCount * i + 0] = this.scene.soundSources[i].x;
            soundSourceData[dataCount * i + 1] = this.scene.soundSources[i].y;
            soundSourceData[dataCount * i + 2] = this.scene.soundSources[i].intensity;
            soundSourceData[dataCount * i + 3] = 0;
        }

        this.rendererData.device.queue.writeBuffer(this.sound_source_buffer, 0, soundSourceData, 0,
            dataCount * this.scene.soundSources.length);
    }

    private setSceneData()
    {
        this.rendererData.device.queue.writeBuffer(
            this.scene_parameters, 0,
            new Int32Array(
                [
                    this.rendererData.canvas.width,
                    this.rendererData.canvas.height,
                    this.scene.lines.length,
                    this.scene.soundSources.length,
                ]
            ), 0, 4
        )
    }
}