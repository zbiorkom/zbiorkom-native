import "reflect-metadata";

export type PrimitiveType =
    | "u8"
    | "i8"
    | "u16"
    | "i16"
    | "u32"
    | "i32"
    | "f32"
    | "f64"
    | "i64"
    | "string"
    | "boolean";
export type FieldType = PrimitiveType | Function | [PrimitiveType | Function];

interface FieldMetadata {
    key: string;
    type: FieldType;
}

const SCHEMA_KEY = Symbol("compact:schema");
const NULL_INDEX = 0xffffffff;
const SCHEMA_CACHE = new Map<any, FieldMetadata[]>();

export abstract class CompactModel<T> {
    constructor(init?: T) {
        if (init) Object.assign(this, init);
    }
}

export function Field(type: FieldType) {
    return function (target: any, propertyKey: string) {
        const fields: FieldMetadata[] = Reflect.getMetadata(SCHEMA_KEY, target) || [];
        fields.push({ key: propertyKey, type });
        Reflect.defineMetadata(SCHEMA_KEY, fields, target);

        SCHEMA_CACHE.delete(target.prototype || target);
    };
}

export function getSchema(target: any): FieldMetadata[] {
    const proto = target.prototype || target;
    let schema = SCHEMA_CACHE.get(proto);

    if (!schema) {
        schema = Reflect.getMetadata(SCHEMA_KEY, proto) || [];
        SCHEMA_CACHE.set(proto, schema!);
    }
    return schema!;
}

export class CompactDeserializer {
    private buffer: Uint8Array;
    private view: DataView;
    private offset = 0;
    private decoder = new TextDecoder();

    private stringTable: string[] = [];
    private objectCache = new Array<any>();
    private objectOffsets: Uint32Array;

    constructor(buffer: ArrayBuffer | Uint8Array) {
        this.buffer = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);

        this.view = new DataView(this.buffer.buffer, this.buffer.byteOffset, this.buffer.byteLength);

        this.objectOffsets = new Uint32Array(0);
    }

    public unpack<T>(RootClass: any): T | T[] {
        this.offset = 0;
        this.stringTable = [];

        this.objectCache.length = 0;

        const strCount = this.readU32();

        this.stringTable = new Array(strCount);

        for (let i = 0; i < strCount; i++) {
            const len = this.readU16();

            const str = this.decoder.decode(this.buffer.subarray(this.offset, this.offset + len));
            this.stringTable[i] = str;
            this.offset += len;
        }

        const objCount = this.readU32();
        this.objectOffsets = new Uint32Array(objCount);
        this.objectCache = new Array(objCount);

        for (let i = 0; i < objCount; i++) {
            const size = this.readU32();
            this.objectOffsets[i] = this.offset;
            this.offset += size;
        }

        const isArray = this.buffer[this.offset++] === 1;

        if (isArray) {
            const len = this.readU32();
            const result = new Array(len);
            for (let i = 0; i < len; i++) {
                const ref = this.readU32();
                result[i] = this.resolveObject(ref, RootClass);
            }
            return result as any;
        } else {
            const ref = this.readU32();
            return this.resolveObject(ref, RootClass);
        }
    }

    private readU32(): number {
        const buf = this.buffer;
        const p = this.offset;
        const val = (buf[p] | (buf[p + 1] << 8) | (buf[p + 2] << 16) | (buf[p + 3] << 24)) >>> 0;
        this.offset += 4;
        return val;
    }

    private readI32(): number {
        const buf = this.buffer;
        const p = this.offset;
        const val = buf[p] | (buf[p + 1] << 8) | (buf[p + 2] << 16) | (buf[p + 3] << 24);
        this.offset += 4;
        return val;
    }

    private readU16(): number {
        const val = this.buffer[this.offset] | (this.buffer[this.offset + 1] << 8);
        this.offset += 2;
        return val;
    }

    private resolveObject(index: number, Constructor: any): any {
        if (index === NULL_INDEX) return null;

        const cached = this.objectCache[index];
        if (cached !== undefined) return cached;

        const instance = new Constructor();
        this.objectCache[index] = instance;

        const savedOffset = this.offset;
        this.offset = this.objectOffsets[index];

        this.readObjectBody(instance);

        this.offset = savedOffset;
        return instance;
    }

    private readObjectBody(instance: any) {
        const schema = getSchema(instance.constructor);
        for (let i = 0; i < schema.length; i++) {
            const field = schema[i];
            instance[field.key] = this.readValue(field.type);
        }
    }

    private readValue(type: FieldType): any {
        if (Array.isArray(type)) {
            const len = this.readU32();
            const arr = new Array(len);
            const innerType = type[0];
            for (let i = 0; i < len; i++) {
                arr[i] = this.readValue(innerType);
            }
            return arr;
        }

        if (type === "string") {
            const idx = this.readU32();
            return idx === NULL_INDEX ? null : this.stringTable[idx];
        }

        if (typeof type === "function") {
            const refIdx = this.readU32();

            return this.resolveObject(refIdx, type);
        }

        switch (type) {
            case "u32":
                return this.readU32();
            case "i32":
                return this.readI32();
            case "f64": {
                const v = this.view.getFloat64(this.offset, true);
                this.offset += 8;
                return v;
            }
            case "f32": {
                const v = this.view.getFloat32(this.offset, true);
                this.offset += 4;
                return v;
            }
            case "boolean":
                return !!this.buffer[this.offset++];
            case "u8":
                return this.buffer[this.offset++];
            case "i8": {
                const v = this.buffer[this.offset++];
                return (v << 24) >> 24;
            }
            case "u16":
                return this.readU16();
            case "i16": {
                const v = this.readU16();
                return (v << 16) >> 16;
            }
            case "i64": {
                const v = this.view.getBigInt64(this.offset, true);
                this.offset += 8;
                return Number(v);
            }
            default:
                return this.readU32();
        }
    }
}
