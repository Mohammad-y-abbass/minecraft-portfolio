import { Box3, Vector3 } from "three";
import type { Player } from "../player/player";
import type { World } from "../world/world";

export class Physics {

    update(dt: number, player: Player, world: World) {

        // Apply gravity
        player.velocity.y -= player.gravity * dt;

        // Move & resolve per axis
        this.moveAxis(player, world, dt, "x");
        this.moveAxis(player, world, dt, "y");
        this.moveAxis(player, world, dt, "z");

        // Update player's bounds helper
        player.bounds.copy(this.getPlayerAABB(player));
    }

    moveAxis(player: Player, world: World, dt: number, axis: "x" | "y" | "z") {
        const previousPos = player.camera.position[axis];
        const delta = player.velocity[axis] * dt;
        player.camera.position[axis] += delta;

        const playerBox = this.getPlayerAABB(player);
        const candidates = this.broadPhase(playerBox, world);

        for (const block of candidates) {
            const blockBox = new Box3(
                new Vector3(block.x, block.y, block.z),
                new Vector3(block.x + 1, block.y + 1, block.z + 1)
            );

            if (playerBox.intersectsBox(blockBox)) {
                // Revert to previous position
                player.camera.position[axis] = previousPos;

                // Stop velocity
                player.velocity[axis] = 0;

                // Handle grounding for Y axis
                if (axis === "y" && delta < 0) {
                    player.onGround = true;
                }

                break;
            }
        }
    }

    broadPhase(playerBox: Box3, world: World) {

        const min = playerBox.min;
        const max = playerBox.max;

        const candidates = [];

        // Use Math.floor for min (correct lower bound).
        // Use Math.ceil - 1 for max: if max lands exactly on an integer
        // (e.g. 5.0) we do NOT want to include block 5 — the player is
        // flush, not overlapping. Any real penetration (e.g. 5.001) will
        // ceil to 6, minus 1 = 5, so it IS included.
        const minX = Math.floor(min.x);
        const minY = Math.floor(min.y);
        const minZ = Math.floor(min.z);

        const maxX = Math.ceil(max.x) - 1;
        const maxY = Math.ceil(max.y) - 1;
        const maxZ = Math.ceil(max.z) - 1;

        for (let x = minX; x <= maxX; x++) {
            for (let y = minY; y <= maxY; y++) {
                for (let z = minZ; z <= maxZ; z++) {

                    if (world.isSolid(x, y, z)) {
                        candidates.push({ x, y, z });
                    }
                }
            }
        }

        return candidates;
    }

    getPlayerAABB(player: Player) {

        const pos = player.camera.position;

        return new Box3(
            new Vector3(
                pos.x - player.width / 2,
                pos.y - player.eyeHeight,
                pos.z - player.width / 2
            ),
            new Vector3(
                pos.x + player.width / 2,
                pos.y - player.eyeHeight + player.height,
                pos.z + player.width / 2
            )
        );
    }
}