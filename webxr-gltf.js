import { ARButton } from 'https://unpkg.com/three@0.126.0/examples/jsm/webxr/ARButton.js';    // (module) button for starting webxr session

let camera, scene, renderer;
let loader;
let model;

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);
}

function init() {
    const container = document.createElement('div');
    document.body.appendChild(container);

    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(70, window.innerWidth/window.innerHeight, 0.01, 40);     // (fov, aspect, near, far)
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.xr.enabled = true;
    container.appendChild(renderer.domElement);     // canvas

    const light = new THREE.HemisphereLight(0xffffff, 0xbbbbff, 1);    // (sky color, ground color, intensity)
    light.position.set(0.5, 1, 0.25);
    scene.add(light);

    const modelUrl = 'https://raw.githubusercontent.com/immersive-web/webxr-samples/main/media/gltf/space/space.gltf';
    loader = new THREE.GLTFLoader();
    loader.load(       // (model url, onLoad callback, onProgress callback, onError callback)
        modelUrl,
        function (gltf) {   // gets called once
            model = gltf.scene;
            model.position.set(0, 0, -1);
            scene.add(model);
            console.log(model);
        },
        function (event) {  // optional function
            console.log(event);
        },
        function (error) {  // optional function
            console.log(error);
        }
    );

    const button = ARButton.createButton(renderer);
    document.body.appendChild(button);

    window.addEventListener('resize', onWindowResize, false);
}

let degrees = 0;

function rotateModel() {
    degrees -= 0.05;
    model.rotation.y = THREE.Math.degToRad(degrees);
}

function render() {
    if(model !== undefined) {
        rotateModel();
        renderer.render(scene, camera);
    }
}

function animate() {
    renderer.setAnimationLoop(render);      // 60fps
}

init();
animate();