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
     * @param includeBunker Whether to include the underground bunker
     */
    generateCabin(x: number, y: number, z: number, width: number = 6, depth: number = 6, height: number = 4, doorSide: 'N' | 'S' | 'E' | 'W' = 'S', targetChunk?: any, includeBunker: boolean = false) {
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

        if (includeBunker) {
            // Bunker Refined
            const bunkerDepth = 6;
            const bunkerY = y - bunkerDepth - 1;
            const bunkerWidth = width * 2;
            const bunkerDepthSize = depth * 2;
            const halfBW = Math.floor(bunkerWidth / 2);
            const halfBD = Math.floor(bunkerDepthSize / 2);

            // Clear bunker area
            for (let iy = bunkerY; iy < y - 1; iy++) {
                for (let ix = x - halfBW; ix <= x + halfBW; ix++) {
                    for (let iz = z - halfBD; iz <= z + halfBD; iz++) {
                        setBlockBatch(ix, iy, iz, BlockID.Empty);
                    }
                }
            }

            // Bunker Floor
            for (let ix = x - halfBW; ix <= x + halfBW; ix++) {
                for (let iz = z - halfBD; iz <= z + halfBD; iz++) {
                    setBlockBatch(ix, bunkerY - 1, iz, BlockID.Stone);
                }
            }

            // Bunker Walls
            for (let iy = bunkerY; iy < y - 1; iy++) {
                for (let ix = x - halfBW; ix <= x + halfBW; ix++) {
                    for (let iz = z - halfBD; iz <= z + halfBD; iz++) {
                        const isEdgeX = ix === x - halfBW || ix === x + halfBW;
                        const isEdgeZ = iz === z - halfBD || iz === z + halfBD;
                        if (isEdgeX || isEdgeZ) {
                            setBlockBatch(ix, iy, iz, BlockID.Stone);
                        }
                    }
                }
            }

            // Bunker Ceiling (under cabin floor)
            for (let ix = x - halfBW; ix <= x + halfBW; ix++) {
                for (let iz = z - halfBD; iz <= z + halfBD; iz++) {
                    // Only place ceiling where there's no cabin floor already (cabin floor is y-1)
                    const isInCabinFloor = Math.abs(ix - x) <= halfW && Math.abs(iz - z) <= halfD;
                    if (!isInCabinFloor) {
                        setBlockBatch(ix, y - 1, iz, BlockID.Stone);
                    }

                    // Place lamps in corners of the bunker ceiling
                    const isCornerX = Math.abs(ix - x) === halfBW - 1;
                    const isCornerZ = Math.abs(iz - z) === halfBD - 1;
                    if (isCornerX && isCornerZ) {
                        setBlockBatch(ix, y - 2, iz, BlockID.Lamp);
                    }
                }
            }

            // Stairs opening and stairs
            const stairX = x + halfW - 1;
            const stairZStart = z + halfD - 1;

            for (let i = 0; i <= bunkerDepth; i++) {
                const currentY = y - 1 - i;
                const currentZ = stairZStart - i;

                // Clear space for player above the stair (2x2 hole for easier entry)
                for (let dx = 0; dx <= 1; dx++) {
                    for (let dz = 0; dz <= 1; dz++) {
                        setBlockBatch(stairX - dx, currentY + 1, currentZ - dz, BlockID.Empty);
                        setBlockBatch(stairX - dx, currentY + 2, currentZ - dz, BlockID.Empty);
                        setBlockBatch(stairX - dx, currentY + 3, currentZ - dz, BlockID.Empty);
                    }
                }

                // Place the stair block (2 blocks wide for easier walking)
                setBlockBatch(stairX, currentY, currentZ, BlockID.Stone);
                setBlockBatch(stairX - 1, currentY, currentZ, BlockID.Stone);

                // If it's the top stair, make sure there's an opening in the floor
                if (i === 0) {
                    setBlockBatch(stairX, y - 1, currentZ, BlockID.Empty);
                    setBlockBatch(stairX - 1, y - 1, currentZ, BlockID.Empty);
                    setBlockBatch(stairX, y - 1, currentZ - 1, BlockID.Empty);
                    setBlockBatch(stairX - 1, y - 1, currentZ - 1, BlockID.Empty);
                }
            }
        }
    }
}
