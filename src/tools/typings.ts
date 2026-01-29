export type Point = [number, number];
export type Bounds = [minLon: number, minLat: number, maxLon: number, maxLat: number];

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
    location?: Point;
    icon?: string;
    faresUrl?: string;
    dataSources?: {
        text: string;
        url?: string;
    }[];
};

export enum VehicleType {
    Tram = 0,
    Subway = 1,
    Train = 2,
    Bus = 3,
    Ferry = 4,
    Trolleybus = 11,
}

export type Route = [
    id: string,
    city: string,
    name: string,
    longName: string,
    agency: string,
    type: VehicleType,
    color: string,
];

export enum ERoute {
    id,
    city,
    name,
    longName,
    agency,
    type,
    color,
}

export type Stop = [
    id: string,
    city: string,
    name: string,
    code: string | undefined,
    location: Point,
    vehicleTypes: VehicleType[],
    bearing: number | undefined,
    direction: string | undefined,
    routes: number[],
];

export enum EStop {
    id,
    city,
    name,
    code,
    location,
    vehicleTypes,
    bearing,
    direction,
    routes,
}

export type Trip = {
    id: string;
    city: string;
    route: Route;
    headsign: string;
    brigade: string | undefined;
    shortName: string | undefined;
};

export enum ETrip {
    id,
    city,
    route,
    headsign,
    brigade,
    shortName,
}

export interface RouteDetails {
    route: Route;
    graph: RouteGraphDirection[];
}

export interface RouteGraphDirection {
    stops: [Stop, EDirectionNodeType][];
    connections: RouteConnection[];
}

export enum ERouteGraphDirectionStop {
    stop,
    type,
}

export type RouteConnection = [
    startIndex: number,
    endIndex: number,
    edgeType: EDirectionEdgeType,
    shape: string,
];

export enum ERouteConnection {
    startIndex,
    endIndex,
    edgeType,
    shape,
}

export enum EDirectionNodeType {
    Normal = 0,
    Branch = 1,
}

export enum EDirectionEdgeType {
    Normal = 0,
    Deviation = 1,
    Branch = 2,
}
