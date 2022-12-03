struct Line {
    p1: vec2<i32>,
    p2: vec2<i32>,
}

struct Data {
    lines: array<Line>,
}

struct SceneData {
    listenerPos: vec2<i32>,
    screenDimension: vec2<i32>,
    reflectionCount: i32,
    lineCount: i32,
}

struct Ray
{
    origin: vec2<i32>,
    destination: vec2<f32>,
}

struct HitResult
{
    hit: bool,
    point: vec2<i32>,
}

@group(0) @binding(0) var color_buffer: texture_storage_2d<rgba8unorm, write>;
@group(0) @binding(1) var<storage, read> data: Data;
@group(0) @binding(2) var<uniform> scene: SceneData;

@compute @workgroup_size(1,1,1)
fn main(@builtin(global_invocation_id) id : vec3<u32>) 
{
    let ray: Ray = initRay(i32(id.x));

    for (var i: u32 = 0; i < u32(scene.lineCount); i++) 
    {
        let hitResult: HitResult = lineIntersection(ray, data.lines[i]);
        if (hitResult.hit)
        {
            textureStore(color_buffer, vec2<u32>(u32(hitResult.point.x), u32(hitResult.point.y)), vec4<f32>(1.0, 1.0, 0, 1.0));
        }
    }

    textureStore(color_buffer, vec2<u32>(u32(ray.destination.x), u32(ray.destination.y)), vec4<f32>(1.0, 0, 0, 1.0));
    textureStore(color_buffer, vec2<u32>(u32(ray.origin.x), u32(ray.origin.y)), vec4<f32>(1.0, 1, 1, 1.0));

    textureStore(color_buffer, vec2<u32>(u32(data.lines[0].p1.x), u32(data.lines[0].p1.y)), vec4<f32>(0.1, 0.8, 1.0, 1.0));
    textureStore(color_buffer, vec2<u32>(u32(data.lines[0].p2.x), u32(data.lines[0].p2.y)), vec4<f32>(0.1, 0.8, 1.0, 1.0));
}

//Line intersection algorithm
//Based off Andre LeMothe's algorithm in "Tricks of the Windows Game Programming Gurus".
fn lineIntersection(ray: Ray, line: Line) -> HitResult
{
    var hitResult: HitResult;

    let p1 = vec2I32toVec2F32(ray.origin);
    let p2 = ray.destination;
    let p3 = vec2I32toVec2F32(line.p1);
    let p4 = vec2I32toVec2F32(line.p2);

    //Line 1 Vector
    let v1 = p2 - p1;
    
    //Line 2 Vector
    let v2 = p4 - p3;
    
    //Cross of vectors
    let d = cross2D(v1,v2);
    
    //Difference between start points
    let LA_delta = p1 - p3;
    
    //Percentage v1 x LA_delta is along v1 x v2
    let s = cross2D(v1,LA_delta) / d;
    
    //Percentage v2 x LA_delta is along v1 x v2
    let t = cross2D(v2,LA_delta) / d;
    
    //Do segments intersect?
    //Bounds test
    if (s >= 0.0 && s <= 1.0 && t >= 0.0 && t <= 1.0)
    {
        //Projection
        hitResult.point = vec2<i32>(i32(p1.x + f32(t * v1.x)), i32(p1.y + f32(t * v1.y)));
        hitResult.hit = true;
        return hitResult;
    }
    hitResult.hit = false;
    return hitResult;
}

fn initRay(index: i32) -> Ray
{
    var ray: Ray;
    ray.origin = scene.listenerPos;

    // ray index
    let rightTopCornerIndex = scene.screenDimension.x * scene.reflectionCount;
    let rightBottomCornerIndex = rightTopCornerIndex + (scene.screenDimension.y * scene.reflectionCount);
    let leftBottomCornerIndex = rightBottomCornerIndex + (scene.screenDimension.x * scene.reflectionCount);

    var circuitX: f32 = 0;
    var circuity: f32 = 0;

    if (index < rightTopCornerIndex)
    {
        circuitX = f32(index / scene.reflectionCount);
        circuity = 0.0;
    }
    else if (index < rightBottomCornerIndex)
    {
        circuitX = f32(scene.screenDimension.x);
        circuity = f32((index - rightTopCornerIndex) / scene.reflectionCount);
    }
    else if (index < leftBottomCornerIndex)
    {
        circuitX = f32((index - rightBottomCornerIndex) / scene.reflectionCount);
        circuity = f32(scene.screenDimension.y);
    }
    else
    {
        circuitX = 0.0;
        circuity = f32((index - leftBottomCornerIndex) / scene.reflectionCount);
    }

    ray.destination = vec2<f32>(circuitX, circuity);

    return ray;
}

fn vec2I32toVec2F32(v: vec2<i32>) -> vec2<f32>
{
    return vec2<f32>(f32(v.x), f32(v.y));
}

//Cross product of 2d vectors returns scalar
//1 = perpendicular, 0 = colinear
fn cross2D(v1: vec2<f32>, v2: vec2<f32>) -> f32
{
    return v1.x * v2.y - v1.y * v2.x;
}