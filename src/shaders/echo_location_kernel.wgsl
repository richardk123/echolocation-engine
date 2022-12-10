struct Line {
    p1: vec2<f32>,
    p2: vec2<f32>,
}

struct SoundSource {
    pos: vec2<f32>,
    intensity: f32,
}

struct SceneData {
    screenDimension: vec2<i32>,
    lineCount: i32,
    soundCount: i32,
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
    distance: f32,
}

@group(0) @binding(0) var color_buffer: texture_storage_2d<rgba8unorm, write>;
@group(0) @binding(1) var<storage, read> data: array<Line>;
@group(0) @binding(2) var<storage, read> soundSources: array<SoundSource>;
@group(0) @binding(3) var<uniform> scene: SceneData;

@compute @workgroup_size(1,1,1)
fn main(@builtin(global_invocation_id) id : vec3<u32>) 
{
//            textureStore(color_buffer, vec2<u32>(u32(l.p1.x), u32(l.p1.y)), vec4<f32>(1, 1, 1, 1.0));
//            textureStore(color_buffer, vec2<u32>(u32(l.p2.x), u32(l.p2.y)), vec4<f32>(1, 1, 1, 1.0));

//    textureStore(color_buffer, vec2<u32>(id.x, id.y), vec4<f32>(soundSources[0].intensity, soundSources[0].intensity, soundSources[0].intensity, 1.0));
//    textureStore(color_buffer, vec2<u32>(id.x, id.y), vec4<f32>(data[1].p1.x / 100, 1, 1, 1.0));
    let pixelPos = vec2(f32(id.x), f32(id.y));

    for (var i: u32 = 0; i < u32(scene.soundCount); i++)
    {
        let soundPos = soundSources[i].pos;
        let soundIntensity = soundSources[i].intensity;
        let pixelPos = vec2(f32(id.x), f32(id.y));

        let hitResult = findClosestIntersection(soundPos, pixelPos);

        if (hitResult.hit)
        {
            let l = hitResult.l;
            let lineLength = distance(l.p1, l.p2);
            let pixelPosLength = distance(pixelPos, l.p1) + distance(pixelPos, l.p2);

            // pixel is on line
            if (abs(lineLength - pixelPosLength) < 2)
            {
                let alfa = 1 / (hitResult.distance / 100);
                let segCol = segment(pixelPos, l.p1, l.p2) * alfa;
                let color = vec4<f32>(segCol, segCol, segCol, 1.0);
                textureStore(color_buffer, vec2<u32>(id.x, id.y), color);
            }
        }
        else
        {
            let dist = distance(pixelPos, soundPos);
            let alfa = 1 / (dist / 50);
            let segCol = min(0.05 * alfa, 0.05);
            let color = vec4<f32>(segCol, segCol, segCol, 1.0);
            textureStore(color_buffer, vec2<u32>(id.x, id.y), color);
        }
    }
}

fn findClosestIntersection(origin: vec2<f32>, destination: vec2<f32>) -> HitResult
{
    var closestHitResult: HitResult;
    closestHitResult.hit = false;

    var closestDistance: f32 = 999999999999;

    for (var i: u32 = 0; i < u32(scene.lineCount); i++) 
    {
        let hitResult: HitResult = lineIntersection(origin, destination, data[i]);
        if (hitResult.hit)
        {
            let distance = distance(hitResult.p, origin);
            if (distance < closestDistance)
            {
                closestDistance = distance;
                closestHitResult = hitResult;
                closestHitResult.hit = true;
                closestHitResult.l = data[i];
            }
        }
    }
    closestHitResult.distance = closestDistance;
    return closestHitResult;
}

//Line intersection algorithm
//Based off Andre LeMothe's algorithm in "Tricks of the Windows Game Programming Gurus".
fn lineIntersection(origin: vec2<f32>, destination: vec2<f32>, l: Line) -> HitResult
{
    var hitResult: HitResult;

    let p1 = origin;
    let p2 = destination;
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

fn findColor(p: vec2<f32>) -> f32
{
    for (var i: u32 = 0; i < u32(scene.lineCount); i++)
    {
        let l = data[i];
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