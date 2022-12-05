struct Line {
    p1: vec2<f32>,
    p2: vec2<f32>,
}

struct Data {
    lines: array<Line>,
}
struct SceneData {
    lineCount: i32,
}

@group(0) @binding(0) var color_buffer: texture_storage_2d<rgba8unorm, write>;
@group(0) @binding(1) var<storage, read> data: Data;
@group(0) @binding(2) var<uniform> scene: SceneData;

@compute @workgroup_size(1,1,1)
fn main(@builtin(global_invocation_id) id : vec3<u32>) 
{
    let screen_size: vec2<u32> = textureDimensions(color_buffer);
    let screen_pos : vec2<u32> = vec2<u32>(u32(id.x), u32(id.y));

    let color = findColor(vec2<f32>(f32(id.x), f32(id.y)));
    textureStore(color_buffer, screen_pos, vec4<f32>(color, color, color, 1.0));
}

fn findColor(p: vec2<f32>) -> f32
{
    for (var i: u32 = 0; i < u32(scene.lineCount); i++)
    {
        let l = data.lines[i];
        let color = segment(p, l.p1, l.p2);

        if (color > 0)
        {
            return color;
        }
    }
    return 0;
}
// draw line segment from A to B
fn segment(P: vec2<f32>, A: vec2<f32>, B: vec2<f32>) -> f32
{
    let g = B - A;
    let h = P - A;
    let d = length(h - g * clamp(dot(g, h) / dot(g,g), 0.0, 1.0));
	return smoothstep(1, 0.5, d);
}
