struct Line {
    p1: vec2<f32>,
    p2: vec2<f32>,
}

struct Data {
    lines: array<Line>,
}

struct SceneData {
    listenerPos: vec2<i32>,
    screenDimension: vec2<i32>,
    rayCount: i32,
    lineCount: i32,
}

struct Ray
{
    origin: vec2<f32>,
    destination: vec2<f32>,
}

struct HitResult
{
    hit: bool,
    point: vec2<f32>,
}

@group(0) @binding(0) var color_buffer: texture_storage_2d<rgba8unorm, write>;
@group(0) @binding(1) var<storage, read> data: Data;
@group(0) @binding(2) var<uniform> scene: SceneData;

@compute @workgroup_size(1,1,1)
fn main(@builtin(global_invocation_id) id : vec3<u32>) 
{
    let ray: Ray = initRay(i32(id.x));
    var closestHitResult: HitResult;
    var closestDistance: f32 = 99999999999;

    for (var i: u32 = 0; i < u32(scene.lineCount); i++) 
    {
        let hitResult: HitResult = lineIntersection(ray, data.lines[i]);
        if (hitResult.hit)
        {
            let distance = distanceSquared(hitResult.point, ray.origin);
            if (distance < closestDistance)
            {
                closestDistance = distance;
                closestHitResult = hitResult;
            }
        }
    }
    if (closestHitResult.hit)
    {
        textureStore(color_buffer, vec2<u32>(u32(closestHitResult.point.x), u32(closestHitResult.point.y)), vec4<f32>(1.0, 1.0, 0, 1.0));
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

    let p1 = ray.origin;
    let p2 = ray.destination;
    let p3 = line.p1;
    let p4 = line.p2;

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
        hitResult.point = vec2<f32>(p1.x + (t * v1.x), p1.y + (t * v1.y));
        hitResult.hit = true;
        return hitResult;
    }
    hitResult.hit = false;
    return hitResult;
}

fn initRay(index: i32) -> Ray
{
    var ray: Ray;
    ray.origin = vec2I32toVec2F32(scene.listenerPos);
    const pi: f32 = 3.1415;

    let x = sin((((2 * pi) / f32(scene.rayCount)) * f32(index)) - pi) * (f32(scene.screenDimension.x) + f32(scene.screenDimension.y));
    let y = cos((((2 * pi) / f32(scene.rayCount)) * f32(index)) - pi) * (f32(scene.screenDimension.x) + f32(scene.screenDimension.y));
    ray.destination = vec2<f32>(x, y);

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

fn distanceSquared(p1: vec2<f32>, p2: vec2<f32>) -> f32
{
    return (p1.x - p2.x) * (p1.x - p2.x) + (p1.y - p2.y) * (p1.y - p2.y);
}