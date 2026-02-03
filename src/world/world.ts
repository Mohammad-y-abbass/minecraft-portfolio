import * as THREE from "three";
import { type WorldSize, BlockID } from "./types";
import { RNG } from "./rng";
import { Chunk } from "./chunk";

export class World extends THREE.Group {
    size: WorldSize;
    chunks: Map<string, Chunk> = new Map();
    renderDistance = 2; // Radius in chunks
    params = {
        seed: 0,
        terrian: {
            scale: 30,
            magnitude: 0.5,
            offset: 0.2
        }
    }

    constructor({ width = 16, height = 32 }: WorldSize) {
        super();
        this.size = { width, height }; // width is chunk size
    }

    update(playerPos: THREE.Vector3) {
        const chunkX = Math.floor(playerPos.x / this.size.width);
        const chunkZ = Math.floor(playerPos.z / this.size.width);

        const chunksToRemove = new Set(this.chunks.keys());

        for (let x = chunkX - this.renderDistance; x <= chunkX + this.renderDistance; x++) {
            for (let z = chunkZ - this.renderDistance; z <= chunkZ + this.renderDistance; z++) {
                const key = `${x},${z}`;
                chunksToRemove.delete(key);

                if (!this.chunks.has(key)) {
                    this.loadChunk(x, z);
                }
            }
        }

        chunksToRemove.forEach(key => {
            const chunk = this.chunks.get(key);
            if (chunk) {
                this.remove(chunk);
                this.chunks.delete(key);
            }
        });
    }

    loadChunk(x: number, z: number) {
        const key = `${x},${z}`;
        const rng = new RNG(this.params.seed); // In a real app, seed would be combined with x,z
        const chunk = new Chunk(x, z, this.size, this.params);
        chunk.generateTerrain(rng);
        chunk.generateResources(rng);
        chunk.generateMeshes();
        this.add(chunk);
        this.chunks.set(key, chunk);
    }

    getBlock(x: number, y: number, z: number) {
        const chunkX = Math.floor(x / this.size.width);
        const chunkZ = Math.floor(z / this.size.width);
        const key = `${chunkX},${chunkZ}`;
        const chunk = this.chunks.get(key);

        if (chunk) {
            const localX = ((x % this.size.width) + this.size.width) % this.size.width;
            const localZ = ((z % this.size.width) + this.size.width) % this.size.width;
            return chunk.getBlock(localX, y, localZ);
        }
        return null;
    }

    isSolid(x: number, y: number, z: number) {
        return this.getBlock(x, y, z)?.id !== BlockID.Empty;
    }
}