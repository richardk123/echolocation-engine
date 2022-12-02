var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import shader from "./shaders/shaders.wgsl";
import { TriangleMesh } from "./triangle_mesh";
const compatibility_elem = document.getElementById("compatibility-check");
if (navigator.gpu) {
    compatibility_elem.innerText = "works!";
}
else {
    compatibility_elem.innerText = "not work!";
}
const Initialize = () => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const canvas = document.getElementById("gfx-main");
    //adapter: wrapper around (physical) GPU.
    //Describes features and limits
    const adapter = yield ((_a = navigator.gpu) === null || _a === void 0 ? void 0 : _a.requestAdapter());
    //device: wrapper around GPU functionality
    //Function calls are made through the device
    const device = yield (adapter === null || adapter === void 0 ? void 0 : adapter.requestDevice());
    //context: similar to vulkan instance (or OpenGL context)
    const context = canvas.getContext("webgpu");
    const format = "bgra8unorm";
    context.configure({
        device: device,
        format: format,
        alphaMode: "opaque"
    });
    const triangleMesh = new TriangleMesh(device);
    const bindGroupLayout = device.createBindGroupLayout({
        entries: [],
    });
    const bindGroup = device.createBindGroup({
        layout: bindGroupLayout,
        entries: []
    });
    const pipelineLayout = device.createPipelineLayout({
        bindGroupLayouts: [bindGroupLayout]
    });
    const pipeline = device.createRenderPipeline({
        vertex: {
            module: device.createShaderModule({
                code: shader
            }),
            entryPoint: "vs_main",
            buffers: [triangleMesh.bufferLayout,]
        },
        fragment: {
            module: device.createShaderModule({
                code: shader
            }),
            entryPoint: "fs_main",
            targets: [{
                    format: format
                }]
        },
        primitive: {
            topology: "triangle-list"
        },
        layout: pipelineLayout
    });
    //command encoder: records draw commands for submission
    const commandEncoder = device.createCommandEncoder();
    //texture view: image view to the color buffer in this case
    const textureView = context.getCurrentTexture().createView();
    //renderpass: holds draw commands, allocated from command encoder
    const renderpass = commandEncoder.beginRenderPass({
        colorAttachments: [{
                view: textureView,
                clearValue: { r: 0.0, g: 0.0, b: 0.25, a: 1.0 },
                loadOp: "clear",
                storeOp: "store"
            }]
    });
    renderpass.setPipeline(pipeline);
    renderpass.setVertexBuffer(0, triangleMesh.buffer);
    renderpass.setBindGroup(0, bindGroup);
    renderpass.draw(3, 1, 0, 0);
    renderpass.end();
    device.queue.submit([commandEncoder.finish()]);
});
Initialize();
//# sourceMappingURL=index.js.map