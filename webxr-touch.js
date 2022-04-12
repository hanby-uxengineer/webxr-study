import { ARButton } from 'https://unpkg.com/three@0.126.0/examples/jsm/webxr/ARButton.js';    // (module) button for starting webxr session

let camera, scene, renderer;
let controller;
let mesh;

function onSelect() {
    const geometry = new THREE.ConeGeometry(0.1, 0.2, 32).rotateX(Math.PI/2);
    const material = new THREE.MeshPhongMaterial({
        color: 0xffffff * Math.random(),
        shininess: 6,
        flatShading: true,
        transparent: 1,
        opacity: 0.8
    });
    mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(0, 0, -0.6).applyMatrix4(controller.matrixWorld);     // where we tapped in space
    mesh.quaternion.setFromRotationMatrix(controller.matrixWorld);      // rotating toward to camera
    
    scene.add(mesh);
}

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

    controller = renderer.xr.getController(0);
    controller.addEventListener('select', onSelect);    // tap
    scene.add(controller);

    const button = ARButton.createButton(renderer);
    document.body.appendChild(button);

    window.addEventListener('resize', onWindowResize, false);
}

function render() {
    renderer.render(scene, camera);
}

function animate() {
    renderer.setAnimationLoop(render);      // 60fps
}

init();
animate();