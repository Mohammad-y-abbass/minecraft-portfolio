import { DirectionalLight, AmbientLight, Scene, Vector2 } from "three";

export function setupLights(scene: Scene) {
    const sun = new DirectionalLight();
    sun.position.set(50, 50, 50);

    sun.castShadow = true;
    sun.shadow.camera.left = -50;
    sun.shadow.camera.right = 50;
    sun.shadow.camera.top = 50;
    sun.shadow.camera.bottom = -50;
    sun.shadow.camera.near = 0.1;
    sun.shadow.camera.far = 100;
    sun.shadow.bias = -0.005;
    sun.shadow.mapSize = new Vector2(512, 512)
    scene.add(sun);


    const light3 = new AmbientLight();
    light3.intensity = 0.1;
    scene.add(light3);
}