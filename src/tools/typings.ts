export type Point = [number, number];

export type City = {
    id: string;
    name: string;
    description?: string;
    location: Point;
    agencies: Record<string, Agency>;
};

export type Agency = {
    id: string;
    name: string;
    svgIcon?: string;
};

export enum VehicleType {
    Tram = 0,
    Subway = 1,
    Train = 2,
    Bus = 3,
    Ferry = 4,
    Trolleybus = 11,
}
