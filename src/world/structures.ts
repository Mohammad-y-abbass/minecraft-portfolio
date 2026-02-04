import { World } from "./world";
import { BlockID } from "./types";

export class StructureGenerator {
    world: World;

    constructor(world: World) {
        this.world = world;
    }

    /**
     * Generates a small cabin structure
     * @param x Center X
     * @param y Base Y (floor level)
     * @param z Center Z
     * @param width Width of the cabin
     * @param depth Depth of the cabin
     * @param height Height of the walls
     * @param doorSide Side of the cabin the door is on ('N', 'S', 'E', 'W')
     * @param targetChunk Optional specific chunk to modify (for persistent loading)
     */
    generateCabin(x: number, y: number, z: number, width: number = 6, depth: number = 6, height: number = 4, doorSide: 'N' | 'S' | 'E' | 'W' = 'S', targetChunk?: any) {
        const halfW = Math.floor(width / 2);
        const halfD = Math.floor(depth / 2);

        const setBlockBatch = (bx: number, by: number, bz: number, id: number) => {
            if (targetChunk) {
                // Check if bx, bz are actually inside this chunk's world bounds
                const chunkMinX = targetChunk.positionInWorld.x * targetChunk.size.width;
                const chunkMaxX = chunkMinX + targetChunk.size.width;
                const chunkMinZ = targetChunk.positionInWorld.z * targetChunk.size.width;
                const chunkMaxZ = chunkMinZ + targetChunk.size.width;

                if (bx >= chunkMinX && bx < chunkMaxX && bz >= chunkMinZ && bz < chunkMaxZ) {
                    const localX = bx - chunkMinX;
                    const localZ = bz - chunkMinZ;
                    targetChunk.setBlockId(localX, by, localZ, id);
                }
            } else {
                this.world.setBlock(bx, by, bz, id);
            }
        };

        // Clear area first (including some space above)
        for (let iy = y; iy < y + height + 5; iy++) {
            for (let ix = x - halfW - 2; ix <= x + halfW + 2; ix++) {
                for (let iz = z - halfD - 2; iz <= z + halfD - 2; iz++) {
                    setBlockBatch(ix, iy, iz, BlockID.Empty);
                }
            }
        }

        // Floor
        for (let ix = x - halfW; ix <= x + halfW; ix++) {
            for (let iz = z - halfD; iz <= z + halfD; iz++) {
                setBlockBatch(ix, y - 1, iz, BlockID.Stone);
            }
        }

        // Walls
        for (let iy = y; iy < y + height; iy++) {
            for (let ix = x - halfW; ix <= x + halfW; ix++) {
                for (let iz = z - halfD; iz <= z + halfD; iz++) {
                    const isEdgeX = ix === x - halfW || ix === x + halfW;
                    const isEdgeZ = iz === z - halfD || iz === z + halfD;

                    if (isEdgeX || isEdgeZ) {
                        // Door selection (3x3 door)
                        let isDoor = false;
                        if (iy >= y && iy < y + 3) {
                            if (doorSide === 'S' && iz === z - halfD && Math.abs(ix - x) <= 1) isDoor = true;
                            if (doorSide === 'N' && iz === z + halfD && Math.abs(ix - x) <= 1) isDoor = true;
                            if (doorSide === 'W' && ix === x - halfW && Math.abs(iz - z) <= 1) isDoor = true;
                            if (doorSide === 'E' && ix === x + halfW && Math.abs(iz - z) <= 1) isDoor = true;
                        }

                        if (!isDoor) {
                            setBlockBatch(ix, iy, iz, BlockID.Wood);
                        } else {
                            setBlockBatch(ix, iy, iz, BlockID.Empty);
                        }
                    }
                }
            }
        }

        // Roof
        for (let ix = x - halfW - 1; ix <= x + halfW + 1; ix++) {
            for (let iz = z - halfD - 1; iz <= z + halfD + 1; iz++) {
                setBlockBatch(ix, y + height, iz, BlockID.Leaves);
            }
        }
    }
}
