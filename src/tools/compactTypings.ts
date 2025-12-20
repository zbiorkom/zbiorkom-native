import { CompactModel, Field } from "./compact";

export enum StopTimeType {
    Regular = 0,
    Forbidden = 1,
    OnDemand = 2,
}

export enum DepartureStatus {
    Scheduled = 0,
    Live = 1,
    OnPreviousTrip = 2,
    Departed = 3,
    Cancelled = 4,
}

export class Bounds extends CompactModel<Bounds> {
    @Field("f64") minLon!: number;
    @Field("f64") minLat!: number;
    @Field("f64") maxLon!: number;
    @Field("f64") maxLat!: number;
}

export class Route extends CompactModel<Route> {
    @Field("string") id!: string;
    @Field("string") city!: string;
    @Field("string") name!: string;
    @Field("string") agency?: string;
    @Field("u32") type!: number;
    @Field("string") color!: string;
    @Field("string") longName?: string;
    @Field(["string"]) directions!: string[];
}

export class Exit extends CompactModel<Exit> {
    @Field("string") name!: string;
    @Field(["i32"]) location!: number[];
}

export class Stop extends CompactModel<Stop> {
    @Field("string") id!: string;
    @Field("string") city!: string;
    @Field("string") name!: string;
    @Field("string") code?: string;
    @Field(["i32"]) location!: number[];
    @Field(["u32"]) type!: number[];
    @Field([Route]) routes!: Route[];
    @Field("boolean") station!: boolean;
    @Field("i32") bearing?: number;
    @Field("string") direction?: string;
    @Field([Exit]) exits!: Exit[];
}

export class Vehicle extends CompactModel<Vehicle> {
    @Field("string") id!: string;
    @Field("string") city!: string;
    @Field(Route) route!: Route;
    @Field("string") brigade?: string;
    @Field("string") tripId?: string;
    @Field(["i32"]) location!: number[];
    @Field("f32") bearing?: number;
    @Field("i64") lastPing?: number;
}

export class DotVehicles extends CompactModel<DotVehicles> {
    @Field(["string"]) colors!: string[];
    @Field(["i32"]) vehicles!: number[];
}

export class TripDetails extends CompactModel<TripDetails> {
    @Field("string") id!: string;
    @Field("string") city!: string;
    @Field("string") headsign!: string;
    @Field(Route) route!: Route;
    @Field("string") shortName?: string;
    @Field("string") brigade?: string;
}

export class DepartureEvent extends CompactModel<DepartureEvent> {
    @Field("i64") scheduled!: number;
    @Field("i64") predicted!: number;
    @Field("u8") status!: DepartureStatus;
    @Field("string") platform?: string;
}

export class DepartureEntry extends CompactModel<DepartureEntry> {
    @Field(TripDetails) trip!: TripDetails;
    @Field(DepartureEvent) departure!: DepartureEvent;
    @Field(DepartureEvent) destination?: DepartureEvent;
    @Field(Vehicle) position?: Vehicle;
}

export class TripTime extends CompactModel<TripTime> {
    @Field("i64") scheduled!: number;
    @Field("i64") predicted!: number;
    @Field("u8") status!: DepartureStatus;
}

export class TripStop extends CompactModel<TripStop> {
    @Field(Stop) stop!: Stop;
    @Field(TripTime) arrival!: TripTime;
    @Field(TripTime) departure!: TripTime;
    @Field("i32") sequence!: number;
    @Field("u8") type!: StopTimeType;
    @Field("string") platform?: string;
    @Field("string") track?: string;
    @Field(["string"]) alerts!: string[];
}

// Client Messages
export class SubscribeMapFeatures extends CompactModel<SubscribeMapFeatures> {
    @Field("string") city!: string;
    @Field(Bounds) bounds!: Bounds;
    @Field("f32") zoom!: number;
    @Field(["string"]) filterRoutes!: string[];
    @Field(["string"]) filterModels!: string[];
    @Field("i32") filterDirection?: number;
}

export class SubscribeStopDepartures extends CompactModel<SubscribeStopDepartures> {
    @Field("string") city!: string;
    @Field("string") stopId!: string;
    @Field("i32") limit!: number;
    @Field("i64") time!: number;
    @Field(["string"]) destinations!: string[];
}

export class SubscribeTripUpdate extends CompactModel<SubscribeTripUpdate> {
    @Field("string") city!: string;
    @Field("string") tripId?: string;
    @Field("string") vehicleId?: string;
}

export class Unsubscribe extends CompactModel<Unsubscribe> {}

export class ClientMessage extends CompactModel<ClientMessage> {
    @Field(SubscribeMapFeatures) subscribeMapFeatures?: SubscribeMapFeatures;
    @Field(SubscribeStopDepartures) subscribeStopDepartures?: SubscribeStopDepartures;
    @Field(SubscribeTripUpdate) subscribeTripUpdate?: SubscribeTripUpdate;
    @Field(Unsubscribe) unsubscribe?: Unsubscribe;
}

// Server Messages
export class ErrorMessage extends CompactModel<ErrorMessage> {
    @Field("string") code!: string;
    @Field("string") message?: string;
}

export class MapFeaturesUpdate extends CompactModel<MapFeaturesUpdate> {
    @Field([Vehicle]) vehicles!: Vehicle[];
    @Field(DotVehicles) dotVehicles?: DotVehicles;
    @Field([Stop]) stops!: Stop[];
    @Field("boolean") stopsChanged!: boolean;
}

export class StopDeparturesUpdate extends CompactModel<StopDeparturesUpdate> {
    @Field(Stop) stop?: Stop;
    @Field([DepartureEntry]) departures!: DepartureEntry[];
}

export class TripUpdateData extends CompactModel<TripUpdateData> {
    @Field("string") city!: string;
    @Field(TripDetails) trip?: TripDetails;
    @Field("string") shape?: string;
    @Field(Vehicle) vehicle?: Vehicle;
    @Field([TripStop]) stops!: TripStop[];
    @Field("i32") sequence?: number;
    @Field("i64") lastUpdate?: number;
}

export class ServerMessage extends CompactModel<ServerMessage> {
    @Field(MapFeaturesUpdate) mapFeaturesUpdate?: MapFeaturesUpdate;
    @Field(StopDeparturesUpdate) stopDeparturesUpdate?: StopDeparturesUpdate;
    @Field(TripUpdateData) tripUpdateData?: TripUpdateData;
    @Field(ErrorMessage) error?: ErrorMessage;
}
