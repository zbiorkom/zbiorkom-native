import { Point } from "./typings";

export const apiBase = "https://api.zbiorkom.live:2053/api6";
export const halfTransparentText = "rgba(255, 255, 255, 0.8)";
export const darkFilter = "invert(1) hue-rotate(180deg) contrast(90%) brightness(90%)";

export const normalizeLocation = ([lon, lat]: number[], locationPrecision = 1e6): Point => [
    lon / locationPrecision,
    lat / locationPrecision,
];
