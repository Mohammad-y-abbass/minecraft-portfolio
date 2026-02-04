import * as THREE from 'three';

export class PosterManager {
    scene: THREE.Scene;

    constructor(scene: THREE.Scene) {
        this.scene = scene;
    }

    /**
     * Creates a text poster on a wall
     * @param x X position
     * @param y Y position
     * @param z Z position
     * @param rotation Rotation in radians (Euler)
     * @param text Text content
     * @param width Poster width
     * @param height Poster height
     */
    addPoster(x: number, y: number, z: number, rotation: THREE.Euler, text: string, width: number = 4, height: number = 3) {
        const canvas = document.createElement('canvas');
        canvas.width = 1024;
        canvas.height = 768;
        const ctx = canvas.getContext('2d');

        if (!ctx) return;

        // Background
        ctx.fillStyle = '#1e1e1e';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Border
        ctx.strokeStyle = '#5d4037';
        ctx.lineWidth = 40;
        ctx.strokeRect(0, 0, canvas.width, canvas.height);

        // Text settings
        ctx.fillStyle = '#eeeeee';
        ctx.font = 'bold 40px "Courier New", Courier, monospace';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';

        // Multi-line text wrapping
        const maxWidth = canvas.width - 120;
        const lineHeight = 50;
        const startX = 60;
        const startY = 80;

        this.wrapText(ctx, text, startX, startY, maxWidth, lineHeight);

        const texture = new THREE.CanvasTexture(canvas);
        texture.needsUpdate = true;
        const material = new THREE.MeshBasicMaterial({ map: texture, side: THREE.DoubleSide });
        const geometry = new THREE.PlaneGeometry(width, height);
        const mesh = new THREE.Mesh(geometry, material);

        mesh.position.set(x, y, z);
        mesh.rotation.copy(rotation);

        this.scene.add(mesh);
        return mesh;
    }

    private wrapText(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number, lineHeight: number) {
        const segments = text.split('\n');

        for (let i = 0; i < segments.length; i++) {
            const words = segments[i].split(' ');
            let line = '';

            for (let n = 0; n < words.length; n++) {
                const testLine = line + words[n] + ' ';
                const metrics = ctx.measureText(testLine);
                const testWidth = metrics.width;
                if (testWidth > maxWidth && n > 0) {
                    ctx.fillText(line, x, y);
                    line = words[n] + ' ';
                    y += lineHeight;
                } else {
                    line = testLine;
                }
            }
            ctx.fillText(line, x, y);
            y += lineHeight; // Small extra gap for manual breaks
        }
    }
}
