struct Line {
    p1: vec2<i32>,
    p2: vec2<i32>,
}

struct Data {
    lines: array<Line>,
}

@group(0) @binding(0) var color_buffer: texture_storage_2d<rgba8unorm, write>;
@group(0) @binding(1) var<storage, read> data: Data;

@compute @workgroup_size(1,1,1)
fn main(@builtin(global_invocation_id) id : vec3<u32>) 
{
    let screen_size: vec2<u32> = textureDimensions(color_buffer);
    let screen_pos : vec2<u32> = vec2<u32>(u32(id.x), u32(id.y));

    let line: Line = data.lines[id.x];
    let p1: vec2<i32> = line.p1;
    let p2: vec2<i32> = line.p2;
    let p1_screen_pos : vec2<u32> = vec2<u32>(u32(p1.x), u32(p1.y));
    let p2_screen_pos : vec2<u32> = vec2<u32>(u32(p2.x), u32(p2.y));

    textureStore(color_buffer, p1_screen_pos, vec4<f32>(1.0, 1.0, 1.0, 1.0));
    textureStore(color_buffer, p2_screen_pos, vec4<f32>(1.0, 1.0, 1.0, 1.0));
}
