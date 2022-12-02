@group(0) @binding(0) var color_buffer: texture_storage_2d<rgba8unorm, write>;

@compute @workgroup_size(1,1,1)
fn main(@builtin(global_invocation_id) GlobalInvocationID : vec3<u32>) {

    let screen_size: vec2<u32> = textureDimensions(color_buffer);
    let screen_pos : vec2<u32> = vec2<u32>(u32(GlobalInvocationID.x), u32(GlobalInvocationID.y));

    var pixel_color : vec3<f32> = vec3<f32>(0.0, 0.0, 0.0);

    var positions = array<vec2<u32>, 1>(
        vec2<u32>( 100,  100)
    );

    if (positions[0].x == screen_pos.x && positions[0].y == screen_pos.y)
    {
        textureStore(color_buffer, screen_pos, vec4<f32>(vec3<f32>(1.0, 1.0, 1.0), 1.0));
    }
    else
    {
        textureStore(color_buffer, screen_pos, vec4<f32>(pixel_color, 1.0));
    }
}