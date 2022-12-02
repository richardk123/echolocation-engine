import { Scene } from "../../data/scene";

export interface RendererData
{
    canvas: HTMLCanvasElement;
    scene: Scene;

    // Device/Context objects
    adapter: GPUAdapter;
    device: GPUDevice;
    context: GPUCanvasContext;
    format : GPUTextureFormat;
}