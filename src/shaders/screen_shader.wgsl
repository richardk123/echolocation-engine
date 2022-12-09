struct Line {
    p1: vec2<f32>,
    p2: vec2<f32>,
}

struct Data {
    lines: array<Line>,
}
struct SceneData {
    lineCount: i32,
    screenDimension: vec2<i32>,
}

struct VertexOutput {
    @builtin(position) Position : vec4<f32>,
    @location(0) TexCoord : vec2<f32>,
}

@vertex
fn vert_main(@builtin(vertex_index) VertexIndex : u32) -> VertexOutput {

    var positions = array<vec2<f32>, 6>(
        vec2<f32>( 1.0,  1.0),
        vec2<f32>( 1.0, -1.0),
        vec2<f32>(-1.0, -1.0),
        vec2<f32>( 1.0,  1.0),
        vec2<f32>(-1.0, -1.0),
        vec2<f32>(-1.0,  1.0)
    );

    var texCoords = array<vec2<f32>, 6>(
        vec2<f32>(1.0, 0.0),
        vec2<f32>(1.0, 1.0),
        vec2<f32>(0.0, 1.0),
        vec2<f32>(1.0, 0.0),
        vec2<f32>(0.0, 1.0),
        vec2<f32>(0.0, 0.0)
    );

    var output : VertexOutput;
    output.Position = vec4<f32>(positions[VertexIndex], 0.0, 1.0);
    output.TexCoord = texCoords[VertexIndex];
    return output;
}

@group(0) @binding(0) var screen_sampler : sampler;
@group(0) @binding(1) var color_buffer : texture_2d<f32>;
@group(0) @binding(2) var<storage, read> data: Data;
@group(0) @binding(3) var<uniform> scene: SceneData;
@fragment
fn frag_main(@location(0) coord : vec2<f32>) -> @location(0) vec4<f32> {

    let result = textureSample(color_buffer, screen_sampler, coord);;
    let color = findColor(vec2(coord.x * data.sc, coord.y * 600));

    if (color != 0)
    {
        return vec4<f32>(color, color, color, 1.0);
    }
    return result;
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