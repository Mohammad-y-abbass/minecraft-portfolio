import { BlockID } from "./types";

export const blocks = {
    [BlockID.Empty]: { name: "Empty", color: 0x000000 },
    [BlockID.Grass]: { name: "Grass", color: 0x00ff00 },
    [BlockID.Dirt]: { name: "Dirt", color: 0x8b4513 },
} as const;
