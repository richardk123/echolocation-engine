import { Scene } from "../data/scene";
import { EcholocationRenderer } from "./echo_location_renderer";
import { RendererData } from "./data/renderer_data";
import { ScreenRenderer } from "./screen_renderer";
import { Renderer } from "./data/renderer";

export class MainRenderer implements RendererData {

    canvas: HTMLCanvasElement;
    scene: Scene;

    // Device/Context objects
    adapter: GPUAdapter;
    device: GPUDevice;
    context: GPUCanvasContext;
    format : GPUTextureFormat;

    constructor(canvas: HTMLCanvasElement, scene: Scene) {
        this.canvas = canvas;
        this.scene = scene;
    }

   async Initialize() 
   {

        await this.setupDevice();

        const echoLocationRenderer = new EcholocationRenderer(this, this.scene);
        const screenRenderer = new ScreenRenderer(this, echoLocationRenderer.color_buffer_view);

        this.render([echoLocationRenderer, screenRenderer]);
    }

    async setupDevice() 
    {

        //adapter: wrapper around (physical) GPU.
        //Describes features and limits
        this.adapter = <GPUAdapter> await navigator.gpu?.requestAdapter();
        //device: wrapper around GPU functionality
        //Function calls are made through the device
        this.device = <GPUDevice> await this.adapter?.requestDevice();
        //context: similar to vulkan instance (or OpenGL context)
        this.context = <GPUCanvasContext> this.canvas.getContext("webgpu");
        this.format = "bgra8unorm";
        this.context.configure({
            device: this.device,
            format: this.format,
            alphaMode: "opaque"
        });

    }

    render = (renderers: Renderer[]) => 
    {

        const commandEncoder : GPUCommandEncoder = this.device.createCommandEncoder();

        renderers.forEach(renderer => renderer.render(commandEncoder));
    
        this.device.queue.submit([commandEncoder.finish()]);

        requestAnimationFrame(() => this.render(renderers));
    }
    
}