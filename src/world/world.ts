import * as THREE from "three";

const geometry = new THREE.BoxGeometry(1, 1, 1);
const material = new THREE.MeshLambertMaterial({ color: 0x00ff00 });

export class World extends THREE.Group {
    size: { width: number, height: number };
    constructor({ width = 64, height = 32 }) {
        super();
        this.size = { width, height };
        this.generate();
    }

    generate() {
        const MAX_BLOCKS = this.size.width * this.size.height * this.size.width;
        const mesh = new THREE.InstancedMesh(geometry, material, MAX_BLOCKS);
        mesh.count = 0

        const matrix = new THREE.Matrix4();
        for (let x = 0; x < this.size.width; x++) {
            for (let y = 0; y < this.size.height; y++) {
                for (let z = 0; z < this.size.width; z++) {
                    matrix.setPosition(x, y, z);
                    mesh.setMatrixAt(mesh.count, matrix);
                    mesh.count++;
                }
            }
        }
        this.add(mesh);
    }
}
