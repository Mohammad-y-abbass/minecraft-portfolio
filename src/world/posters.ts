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
        canvas.width = 2048;
        canvas.height = 1536;
        const ctx = canvas.getContext('2d');

        if (!ctx) return;

        // Background
        ctx.fillStyle = '#1e1e1e';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Border
        ctx.strokeStyle = '#5d4037';
        ctx.lineWidth = 60;
        ctx.strokeRect(0, 0, canvas.width, canvas.height);

        // Multi-line text settings
        const maxWidth = canvas.width - 200;
        const startX = 100;
        const startY = 120;
        const maxTextHeight = canvas.height - 240;

        // Adaptive Font Scaling
        let fontSize = 80;
        let lineHeight = 100;

        while (fontSize > 20) {
            ctx.font = `bold ${fontSize}px "Courier New", Courier, monospace`;
            const height = this.measureTextHeight(ctx, text, maxWidth, lineHeight);
            if (height <= maxTextHeight) break;
            fontSize -= 4;
            lineHeight = Math.floor(fontSize * 1.25);
        }

        ctx.fillStyle = '#eeeeee';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';

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

    private measureTextHeight(ctx: CanvasRenderingContext2D, text: string, maxWidth: number, lineHeight: number): number {
        const segments = text.split('\n');
        let totalHeight = 0;

        for (let i = 0; i < segments.length; i++) {
            const words = segments[i].split(' ');
            let line = '';
            let linesInSegment = 1;

            for (let n = 0; n < words.length; n++) {
                const testLine = line + words[n] + ' ';
                const metrics = ctx.measureText(testLine);
                if (metrics.width > maxWidth && n > 0) {
                    line = words[n] + ' ';
                    linesInSegment++;
                } else {
                    line = testLine;
                }
            }
            totalHeight += linesInSegment * lineHeight;
        }
        return totalHeight;
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
            y += lineHeight;
        }
    }
}
