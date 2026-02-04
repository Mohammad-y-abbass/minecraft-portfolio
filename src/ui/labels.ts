import * as THREE from "three";
import { Player } from "../player/player";

export interface Label {
    x: number;
    y: number;
    z: number;
    text: string;
    element: HTMLElement;
}

export class LabelManager {
    labels: Label[] = [];
    player: Player;

    constructor(player: Player) {
        this.player = player;
    }

    addLabel(x: number, y: number, z: number, text: string) {
        const element = document.createElement('div');
        element.className = 'cabin-label';
        element.innerHTML = text;
        document.body.appendChild(element);

        this.labels.push({ x, y, z, text, element });
    }

    update() {
        this.labels.forEach(label => {
            const pos = new THREE.Vector3(label.x, label.y, label.z);

            // Project to screen coordinate
            const vector = pos.project(this.player.camera);

            // Hide if behind camera
            if (vector.z > 1) {
                label.element.style.display = 'none';
                return;
            }

            label.element.style.display = 'block';

            const x = (vector.x + 1) * window.innerWidth / 2;
            const y = -(vector.y - 1) * window.innerHeight / 2;

            label.element.style.left = `${x}px`;
            label.element.style.top = `${y}px`;
            label.element.style.opacity = "1";
        });
    }
}
