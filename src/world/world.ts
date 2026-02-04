import * as THREE from "three";
import { type WorldSize, BlockID } from "./types";
import { RNG } from "./rng";
import { Chunk } from "./chunk";
import { PORTFOLIO_DATA } from "../config/portfolio";
import { StructureGenerator } from "./structures";

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
    generator: StructureGenerator;

    constructor({ width = 32, height = 32 }: WorldSize) {
        super();
        this.size = { width, height }; // width is chunk size
        this.generator = new StructureGenerator(this);
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
        const rng = new RNG(this.params.seed);
        const chunk = new Chunk(x, z, this.size, this.params);
        chunk.generateTerrain(rng);
        chunk.generateResources(rng);
        chunk.generateClouds(rng);

        // Check for portfolio cabins in this chunk
        const chunkMinX = x * this.size.width;
        const chunkMaxX = (x + 1) * this.size.width;
        const chunkMinZ = z * this.size.width;
        const chunkMaxZ = (z + 1) * this.size.width;

        Object.values(PORTFOLIO_DATA).forEach(data => {
            // Buffer of 5 blocks for safety
            if (data.x >= chunkMinX - 5 && data.x < chunkMaxX + 5 &&
                data.z >= chunkMinZ - 5 && data.z < chunkMaxZ + 5) {
                const y = chunk.getGroundHeight(data.x, data.z);
                this.generator.generateCabin(data.x, y, data.z, 6, 6, 4, 'N', chunk);
            }
        });

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

    getGroundHeight(x: number, z: number) {
        for (let y = this.size.height - 1; y >= 0; y--) {
            const block = this.getBlock(x, y, z);
            if (block && (block.id === BlockID.Grass || block.id === BlockID.Dirt || block.id === BlockID.Stone)) {
                return y + 1;
            }
        }
        return 0;
    }

    setBlock(x: number, y: number, z: number, id: number, updateMesh = true) {
        const chunkX = Math.floor(x / this.size.width);
        const chunkZ = Math.floor(z / this.size.width);
        const key = `${chunkX},${chunkZ}`;
        const chunk = this.chunks.get(key);

        if (chunk) {
            const localX = ((x % this.size.width) + this.size.width) % this.size.width;
            const localZ = ((z % this.size.width) + this.size.width) % this.size.width;
            chunk.setBlockId(localX, y, localZ, id);

            if (updateMesh) {
                chunk.generateMeshes();

                // Handle neighboring chunks if on boundary
                if (localX === 0) this.chunks.get(`${chunkX - 1},${chunkZ}`)?.generateMeshes();
                if (localX === this.size.width - 1) this.chunks.get(`${chunkX + 1},${chunkZ}`)?.generateMeshes();
                if (localZ === 0) this.chunks.get(`${chunkX},${chunkZ - 1}`)?.generateMeshes();
                if (localZ === this.size.width - 1) this.chunks.get(`${chunkX},${chunkZ + 1}`)?.generateMeshes();
            }
        }
    }
}
