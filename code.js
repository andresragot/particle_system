var canvas = /** @type {HTMLCanvasElement} */(null);
var ctx = /** @type {CanvasRenderingContext2D} */(null);

var time = 0,
    fps = 0,
    framesAcum = 0,
    acumDelta = 0;
var targetDT = 1/60; // 60 fps
var globalDT;

// game variables
var assets = {
    smoke: {
        img: null,
        path: "./assets/smoke.png"
    },
    snow: {
        img: null,
        path: "./assets/snow.png"
    },
    waterdrop: {
        img: null,
        path: "./assets/waterdrop.png"
    }
}

const rainParticlesConfig = {

}

const snowParticlesConfig = {

}

const smokeStrangeConfig = {
    maxParticleCount: 100,

    emitterType: 0,
    
    MIN_INITIAL_VELOCITY: 10,
    MAX_INITIAL_VELOCITY: 60,

    MIN_DIRECTION_Y: -1,
    MAX_DIRECTION_Y: 1,

    MIN_DIRECTION_X: -1,
    MAX_DIRECTION_X: 1,

    MIN_OPACITY_DECREMENT_VELOCITY: 0.5,
    MAX_OPACITY_DECREMENT_VELOCITY: 2,

    MIN_INITIAL_SCALE: 0.05,
    MAX_INITIAL_SCALE: 0.5,

    MIN_SCALE_VELOCITY: 0.25,
    MAX_SCALE_VELOCITY: 0.5,

    MIN_INITIAL_ROTATION: 0,
    MAX_INITIAL_ROTATION: PI2,

    MIN_ROTATION_VELOCITY: -0.15,
    MAX_ROTATION_VELOCITY: 0.15,

    MIN_TIME_TO_SPAWN_PARTICLE: 0.01,
    MAX_TIME_TO_SPAWN_PARTICLE: 0.1

}

var particleSystem = null;

function LoadImages(assets, onloaded) {
    let imagesToLoad = 0;
    
    const onload = () => --imagesToLoad === 0 && onloaded();

    /*const onload = function() {
        --imagesToLoad;
        if (imagesToLoad === 0) {
            onloaded();
        }
    }*/

    // iterate through the object of assets and load every image
    for (let asset in assets) {
        if (assets.hasOwnProperty(asset)) {
            imagesToLoad++; // one more image to load

            // create the new image and set its path and onload event
            const img = assets[asset].img = new Image;
            img.src = assets[asset].path;
            img.onload = onload;
        }
     }
    return assets;
}

function Init() {
    canvas = document.getElementById("myCanvas");
    ctx = canvas.getContext("2d");

    // input setup
    SetupKeyboardEvents();
    SetupMouseEvents();
    
    // assets loading
    LoadImages(assets, () => {
        Start();
        Loop();
    });
}

function Start() {
    time = performance.now();

    particleSystem = new ParticleSystem(assets.smoke.img, smokeStrangeConfig);

}

function Loop() {
    requestAnimationFrame(Loop);

    let now = performance.now();

    let deltaTime = (now - time) / 1000;
    globalDT = deltaTime;
    
    time = now;

    framesAcum++;
    acumDelta += deltaTime;

    if (acumDelta >= 1) {
        fps = framesAcum;
        framesAcum = 0;
        acumDelta -= 1;
    }
    
    if (deltaTime > 1)
        return;


    // Update the games logic
    Update(deltaTime);

    // Draw the game elements
    Draw();
}

function Update(deltaTime) {

    // update the particle system
    particleSystem.Update(deltaTime);

    particleSystem.emitter.position.x = Input.mouse.x;
    particleSystem.emitter.position.y = Input.mouse.y;
}

function Draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // draw the fps
    DrawStats(ctx)
}

function DrawStats(ctx) {
    ctx.textAlign = "start";
    ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
    ctx.fillRect(2, 2, 110, 54);
    ctx.fillStyle = "white";
    ctx.font = "12px Comic Sans MS regular";
    
    
    ctx.fillText("FPS: " + fps, 6, 14);
    ctx.fillText("FPS (dt): " + (1 / globalDT).toFixed(2), 6, 32);
    ctx.fillText("deltaTime: " + (globalDT).toFixed(4), 6, 50);

    // Draw the particle system
    particleSystem.Draw(ctx);

}

window.onload = Init;
