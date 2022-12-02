@group(0) @binding(0) var color_buffer: texture_storage_2d<rgba8unorm, write>;

@compute @workgroup_size(1,1,1)
fn main(@builtin(global_invocation_id) id : vec3<u32>) 
{
    let screen_size: vec2<i32> = textureDimensions(color_buffer);
    let screen_pos : vec2<i32> = vec2<i32>(i32(id.x), i32(id.y));

    textureStore(color_buffer, p1_screen_pos, vec4<f32>(0.0, 0.0, 0.0, 1.0));
}
