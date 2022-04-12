import { ARButton } from 'https://unpkg.com/three@0.126.0/examples/jsm/webxr/ARButton.js';    // (module) button for starting webxr session
let camera, scene, renderer;
let polyMesh, donutMesh;

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

    const polyGeometry = new THREE.IcosahedronGeometry(0.1, 1);     // (radius, detail) - meter units
    const polyMaterial = new THREE.MeshPhongMaterial({
        color: new THREE.Color("rgb(100, 225, 150)"),
        shininess: 6,
        flatShading: true,
        transparent: 1,
        opacity: 0.8
    });
    polyMesh = new THREE.Mesh(polyGeometry, polyMaterial);
    polyMesh.position.set(0, 0, -0.5);
    scene.add(polyMesh);

    const donutGeometry = new THREE.TorusGeometry(0.13, 0.02, 12, 50);  // (radius, tube, radial segment, tublar segment)
    const donutMaterial = new THREE.MeshPhongMaterial({
        color: new THREE.Color("rgb(100, 150, 250)"),
        shininess: 6,
        flatShading: true,
        transparent: 1,
        opacity: 0.8
    });
    donutMesh = new THREE.Mesh(donutGeometry, donutMaterial);
    donutMesh.position.set(0, 0, -0.5);
    donutMesh.rotation.x -= 1;
    scene.add(donutMesh);

    const button = ARButton.createButton(renderer);
    document.body.appendChild(button);

    window.addEventListener('resize', onWindowResize, false);
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);
}

function rotateObjects() {
    polyMesh.rotation.y -= 0.01;    // radian units
    donutMesh.rotation.y -= 0.01;
}

function render() {
    rotateObjects();
    renderer.render(scene, camera);
}

function animate() {
    renderer.setAnimationLoop(render);      // 60fps
}

init();
animate();