struct Line {
    p1: vec2<f32>,
    p2: vec2<f32>,
    soundSource: f32,
}

struct Data {
    lines: array<Line>,
}

struct SceneData {
    listenerPos: vec2<i32>,
    screenDimension: vec2<i32>,
    rayCount: i32,
    lineCount: i32,
    reflectionCount: i32,
}

struct Ray
{
    origin: vec2<f32>,
    destination: vec2<f32>,
}

struct HitResult
{
    hit: bool,
    p: vec2<f32>,
    l: Line,
    lineIndex: u32,
    distanceSquared: f32,
}

@group(0) @binding(0) var color_buffer: texture_storage_2d<rgba8unorm, write>;
@group(0) @binding(1) var<storage, read> data: Data;
@group(0) @binding(2) var<uniform> scene: SceneData;

@compute @workgroup_size(1,1,1)
fn main(@builtin(global_invocation_id) id : vec3<u32>) 
{
    var ray: Ray = initRay(i32(id.x));
    var firstHitResult = findClosestIntersection(ray, u32(scene.lineCount + 2));

    if (firstHitResult.hit)
    {
        // reflect ray if it is not sound source
        if (firstHitResult.l.soundSource == 0)
        {
            let alfa = 1 / (sqrt(firstHitResult.distanceSquared) / 100);
            let color = vec4<f32>(1.0, 1.0, 1.0, 1.0) * alfa;
            textureStore(color_buffer, vec2<u32>(u32(firstHitResult.p.x), u32(firstHitResult.p.y)), color);
            rayBounce(ray, firstHitResult);
        }
        // direct hit to sound source
        else
        {
            let alfa = 1 / (sqrt(firstHitResult.distanceSquared) / 100);
            let color = vec4<f32>(1.0, 1.0, 1.0, 1.0) * alfa;
            textureStore(color_buffer, vec2<u32>(u32(firstHitResult.p.x), u32(firstHitResult.p.y)), color);
        }
    }
}

fn rayBounce(ray: Ray, rayHit: HitResult)
{
    var hitResult: HitResult;
    hitResult.hit = false;
    var totalDistanceSquared = rayHit.distanceSquared;

    for (var i: u32 = 0; i < u32(scene.reflectionCount); i++)
    {
        let ray = rayReflection(ray, rayHit);
        hitResult = findClosestIntersection(ray, rayHit.lineIndex);
        if (!hitResult.hit)
        {
            break;
        }
        totalDistanceSquared += hitResult.distanceSquared;
    }

    if (hitResult.hit && hitResult.l.soundSource == 1)
    {
        let alfa = 1 / (sqrt(totalDistanceSquared) / 100);
        let color = vec4<f32>(1.0, 1.0, 1.0, 1.0) * alfa;
        textureStore(color_buffer, vec2<u32>(u32(rayHit.p.x), u32(rayHit.p.y)), color);
    }
}

fn rayReflection(ray: Ray, hitResult: HitResult) -> Ray
{
    let normal = findLineNormal(hitResult.l);
    
    let rayX = ray.destination.x - hitResult.p.x;
    let rayY = ray.destination.y - hitResult.p.y;

    let dotProduct = (rayX * normal.x) + (rayY * normal.y);

    let dotNormalX = dotProduct * normal.x;
    let dotNormalY = dotProduct * normal.y;

    // calculate and resize new ray destination
    let screenSize = f32(scene.screenDimension.x) + f32(scene.screenDimension.y);
    let reflectedRayX = (ray.destination.x - (dotNormalX * 2));
    let reflectedRayY = (ray.destination.y - (dotNormalY * 2));

    var reflectedRay: Ray;
    reflectedRay.origin = hitResult.p;
    reflectedRay.destination = vec2<f32>(reflectedRayX, reflectedRayY);

    return reflectedRay;
}

fn findClosestIntersection(ray: Ray, ignoredLineIndex: u32) -> HitResult
{
    var closestHitResult: HitResult;
    closestHitResult.hit = false;

    var closestDistance: f32 = 999999999999;

    for (var i: u32 = 0; i < u32(scene.lineCount); i++) 
    {
        if (i == ignoredLineIndex)
        {
            continue;
        }

        let hitResult: HitResult = lineIntersection(ray, data.lines[i]);
        if (hitResult.hit)
        {
            let distance = distanceSquared(hitResult.p, ray.origin);
            if (distance < closestDistance)
            {
                closestDistance = distance;
                closestHitResult = hitResult;
                closestHitResult.hit = true;
                closestHitResult.l = data.lines[i];
            }
        }
    }
    closestHitResult.distanceSquared = closestDistance;
    return closestHitResult;
}

//Line intersection algorithm
//Based off Andre LeMothe's algorithm in "Tricks of the Windows Game Programming Gurus".
fn lineIntersection(ray: Ray, l: Line) -> HitResult
{
    var hitResult: HitResult;

    let p1 = ray.origin;
    let p2 = ray.destination;
    let p3 = l.p1;
    let p4 = l.p2;

    //Line 1 Vector
    let v1 = p2 - p1;
    
    //Line 2 Vector
    let v2 = p4 - p3;
    
    //Cross of vectors
    let d = cross2D(v1,v2);
    
    //Difference between start ps
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
        hitResult.p = vec2<f32>(p1.x + (t * v1.x), p1.y + (t * v1.y));
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

fn findLineNormal(l: Line) -> vec2<f32>
{
    let normalY = l.p2.x - l.p1.x;
    let normalX = l.p1.y - l.p2.y;
    let normalLength = sqrt((normalX * normalX) + (normalY * normalY));

    return vec2<f32>(normalX / normalLength, normalY / normalLength);
}