import { ARButton } from "https://unpkg.com/three@0.126.0/examples/jsm/webxr/ARButton.js";    // (module) button for starting webxr session

let container;
let camera, scene, renderer;
let reticle;
let controller;

function onSelect() {
    if (reticle.visible) {
        const geometry = new THREE.CylinderBufferGeometry(0, 0.05, 0.2, 32);
        const material = new THREE.MeshPhongMaterial({
            color: 0xffffff * Math.random()
        });
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.setFromMatrixPosition(reticle.matrix);
        mesh.quaternion.setFromRotationMatrix(reticle.matrix);

        scene.add(mesh);
    }
}

function addReticleToScene() {
    const geometry = new THREE.RingBufferGeometry(0.15, 0.2, 32).rotateX(-Math.PI/2);
    const material = new THREE.MeshBasicMaterial();

    reticle = new THREE.Mesh(geometry, material);

    reticle.matrixAutoUpdate = false;
    reticle.visible = false;    // start with the reticle not visible
    scene.add(reticle);
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);
}

function init() {
    container = document.createElement("div");
    document.body.appendChild(container);

    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(70, window.innerWidth/window.innerHeight, 0.01, 20);     // (fov, aspect, near, far)
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.xr.enabled = true;
    container.appendChild(renderer.domElement);     // canvas

    const light = new THREE.HemisphereLight(0xffffff, 0xbbbbff, 1);    // (sky color, ground color, intensity)
    light.position.set(0.5, 1, 0.25);
    scene.add(light);

    controller = renderer.xr.getController(0);  // capture user's input
    controller.addEventListener('select', onSelect);
    scene.add(controller);

    addReticleToScene();    // circle visual aid

    const button = ARButton.createButton(renderer, {
        requiredFeatures: ["hit-test"]  // notice a new required feature
    });
    document.body.appendChild(button);
    renderer.domElement.style.display = "none";

    window.addEventListener('resize', onWindowResize, false);
}

let hitTestSource = null;
let localSpace = null;
let hitTestSourceInitialized = false;

async function initializeHitTestSource() {
    const session = renderer.xr.getSession();

    // 1. device's coordinate
    const viewerSpace = await session.requestReferenceSpace("viewer");
    hitTestSource = await session.requestHitTestSource({ space: viewerSpace });

    // 2. environment's coordinate
    localSpace = await session.requestReferenceSpace("local");

    hitTestSourceInitialized = true;

    session.addEventListener("end", () => {
        hitTestSourceInitialized = false;
        hitTestSource = null;
    });
}

function render(timestamp, frame) {
    if (frame) {
        // 1. create a hit test source once and keep it for all the frames
        if (!hitTestSourceInitialized) {
            initializeHitTestSource();
        }

        // 2. get hit test results
        if (hitTestSourceInitialized) {
            const hitTestResults = frame.getHitTestResults(hitTestSource);  // array - more than one (first result is the closet one to the camera)
            
            if (hitTestResults.length > 0) {
                const hit = hitTestResults[0];  // the closest one to the camera
                const pose = hit.getPose(localSpace);   // point on a surface

                reticle.visible = true;
                reticle.matrix.fromArray(pose.transform.matrix);
            } else {    // there is no surface
                reticle.visible = false;
            }
        }
        renderer.render(scene, camera);
    }
}

function animate() {
    renderer.setAnimationLoop(render);      // 60fps
}

init();
animate();