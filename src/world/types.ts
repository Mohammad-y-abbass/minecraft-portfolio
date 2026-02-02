export type WorldSize = {
    width: number;
    height: number;
}

export type WorldData = {
    id: number;
    instanceId: number | null;
}

export const BlockID = {
    Empty: 0,
    Grass: 1,
    Dirt: 2,
    Stone: 3,
    Coal: 4,
    Iron:5
} as const;

export type BlockID = typeof BlockID[keyof typeof BlockID];