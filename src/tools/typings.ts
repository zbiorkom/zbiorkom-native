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
    AerialLift = 6,
    Funicular = 7,
    Trolleybus = 11,
    Monorail = 12,
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

export type Trip = [
    id: string,
    city: string,
    route: Route,
    headsign: string,
    brigade: string | undefined,
    shortName: string | undefined,
    firstStop?: [name: string, arrival: number],
    lastStop?: [name: string, departure: number],
    distance?: number,
];

export enum ETrip {
    id,
    city,
    route,
    headsign,
    brigade,
    shortName,
    firstStop,
    lastStop,
    distance,
}

export type Itinerary = [stops: ItineraryStop[], shape: string];

export enum EItinerary {
    stops,
    shape,
}

export type ItineraryStop = [stop: Stop, alight: number, distance: number];

export enum EItineraryStop {
    stop,
    alight,
    distance,
}

export type StopTime = [scheduledTime: number, delay: number, status: StopDepartureStatus, platform?: string];

export enum EStopTime {
    scheduledTime,
    delay,
    status,
    platform,
}

export type Position = [
    id: string,
    city: string,
    route: Route,
    brigade: string | undefined,
    location: Point,
    bearing: number | undefined,
    timestamp?: number,
    tripIdx?: number,
    percentTraveled?: number,
];

export enum EPosition {
    id,
    city,
    route,
    brigade,
    location,
    bearing,
    timestamp,
    tripIdx,
    percentTraveled,
}

export type DotPosition = [color: string, location: Point];

export enum EDotPosition {
    color,
    location,
}

export type StopDeparture = [trip: Trip, position: Position | undefined, stopTime: StopTime];

export enum EStopDeparture {
    trip,
    position,
    stopTime,
}

export type TripStopTime = [arrival: StopTime, departure: StopTime];

export enum ETripStopTime {
    arrival,
    departure,
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

export enum StopDepartureStatus {
    Scheduled,
    OnTrip,
    OnPreviousTrip,
    Cancelled,
}

export enum TrafficCongestion {
    Unknown,
    Normal,
    Heavy,
    Severe,
    Stuck,
}
