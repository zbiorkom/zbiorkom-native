import { createContext, useContext, useEffect, useRef, useState, useCallback, useMemo } from "react";
import { AppState, AppStateStatus } from "react-native";
import { CompactDeserializer } from "~/tools/compact";
import {
    ClientMessage,
    ServerMessage,
    MapFeaturesUpdate,
    StopDeparturesUpdate,
    TripUpdateData,
    SubscribeMapFeatures,
    SubscribeStopDepartures,
    SubscribeTripUpdate,
    ErrorMessage,
} from "~/tools/compactTypings";
import { apiBase } from "~/tools/constants";

const pingInterval = 10000;
const unsubscribeDebounce = 100;
const backgroundTimeout = 20000;

export enum ConnectionStatus {
    DISCONNECTED,
    CONNECTING,
    CONNECTED,
}

interface WebSocketContextType {
    status: ConnectionStatus;
    lastMessage: ServerMessage | null;
    subscribe: (key: string, message: ClientMessage) => void;
    unsubscribe: (key: string) => void;
}

const WebSocketContext = createContext<WebSocketContextType | null>(null);

export const WebSocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [status, setStatus] = useState<ConnectionStatus>(ConnectionStatus.DISCONNECTED);
    const [lastMessage, setLastMessage] = useState<ServerMessage | null>(null);

    const socketRef = useRef<WebSocket | null>(null);
    const activeKeysRef = useRef<Set<string>>(new Set());
    const appStateRef = useRef<AppStateStatus>(AppState.currentState);

    const pingTimer = useRef<number | null>(null);
    const reconnectTimer = useRef<number | null>(null);
    const backgroundTimer = useRef<number | null>(null);
    const unsubscribeTimers = useRef<Map<string, number>>(new Map());

    const startPing = useCallback(() => {
        if (pingTimer.current) clearInterval(pingTimer.current);

        pingTimer.current = setInterval(() => {
            const hasSubs = activeKeysRef.current.size > 0;
            const isOpen = socketRef.current?.readyState === WebSocket.OPEN;

            if (isOpen && hasSubs) {
                socketRef.current?.send("ping");
            }
        }, pingInterval);
    }, []);

    const stopPing = useCallback(() => {
        if (pingTimer.current) {
            clearInterval(pingTimer.current);
            pingTimer.current = null;
        }
    }, []);

    const disconnect = useCallback(() => {
        if (socketRef.current) {
            socketRef.current.onclose = null;
            socketRef.current.close();
            socketRef.current = null;
        }

        stopPing();
        setStatus(ConnectionStatus.DISCONNECTED);
    }, [stopPing]);

    const connect = useCallback(() => {
        if (
            socketRef.current?.readyState === WebSocket.OPEN ||
            socketRef.current?.readyState === WebSocket.CONNECTING
        ) {
            return;
        }

        const ws = new WebSocket(apiBase.replace("http", "ws") + "/ws");
        ws.binaryType = "arraybuffer";

        setStatus(ConnectionStatus.CONNECTING);

        ws.onopen = () => {
            setStatus(ConnectionStatus.CONNECTED);
            console.log("WebSocket connected");
            startPing();
        };

        ws.onmessage = (event) => {
            if (event.data === "pong") return;

            if (event.data instanceof ArrayBuffer) {
                const deserializer = new CompactDeserializer(event.data);
                const msg = deserializer.unpack(ServerMessage) as ServerMessage;

                if (msg) setLastMessage(msg);
            }
        };

        ws.onclose = () => {
            stopPing();
            socketRef.current = null;
            setStatus(ConnectionStatus.DISCONNECTED);

            if (activeKeysRef.current.size > 0 && appStateRef.current === "active") {
                reconnectTimer.current = setTimeout(connect, 3000);
            }
        };

        socketRef.current = ws;
    }, [startPing, stopPing]);

    useEffect(() => {
        const subscription = AppState.addEventListener("change", (nextAppState) => {
            const prevAppState = appStateRef.current;
            appStateRef.current = nextAppState;

            if (prevAppState === "active" && nextAppState.match(/inactive|background/)) {
                backgroundTimer.current = setTimeout(() => disconnect(), backgroundTimeout);
            }

            if (prevAppState.match(/inactive|background/) && nextAppState === "active") {
                if (backgroundTimer.current) {
                    clearTimeout(backgroundTimer.current);
                    backgroundTimer.current = null;
                }

                if (activeKeysRef.current.size > 0 && !socketRef.current) {
                    connect();
                }
            }
        });

        return () => {
            subscription.remove();
            if (backgroundTimer.current) clearTimeout(backgroundTimer.current);
        };
    }, [connect, disconnect]);

    const subscribe = useCallback(
        (key: string, message: ClientMessage) => {
            if (unsubscribeTimers.current.has(key)) {
                clearTimeout(unsubscribeTimers.current.get(key)!);
                unsubscribeTimers.current.delete(key);
            }

            activeKeysRef.current.add(key);

            if (!socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) {
                connect();
            } else {
                socketRef.current?.send(JSON.stringify(message));
            }
        },
        [connect]
    );

    const unsubscribe = useCallback(
        (key: string) => {
            if (unsubscribeTimers.current.has(key)) {
                clearTimeout(unsubscribeTimers.current.get(key)!);
            }

            const timeout = setTimeout(() => {
                unsubscribeTimers.current.delete(key);
                activeKeysRef.current.delete(key);

                if (activeKeysRef.current.size === 0) {
                    stopPing();

                    if (socketRef.current?.readyState === WebSocket.OPEN) {
                        socketRef.current.send(JSON.stringify({ unsubscribe: {} }));
                    }
                }
            }, unsubscribeDebounce);

            unsubscribeTimers.current.set(key, timeout);
        },
        [stopPing]
    );

    return (
        <WebSocketContext.Provider value={{ status, lastMessage, subscribe, unsubscribe }}>
            {children}
        </WebSocketContext.Provider>
    );
};

export const useConnectionStatus = () => useContext(WebSocketContext)!.status;

type SubscriptionMap = {
    subscribeMapFeatures: {
        responseKey: "mapFeaturesUpdate";
        options: SubscribeMapFeatures;
        dataType: MapFeaturesUpdate;
    };
    subscribeStopDepartures: {
        responseKey: "stopDeparturesUpdate";
        options: SubscribeStopDepartures;
        dataType: StopDeparturesUpdate;
    };
    subscribeTripUpdate: {
        responseKey: "tripUpdateData";
        options: SubscribeTripUpdate;
        dataType: TripUpdateData;
    };
};

type UseWebsocketSubscriptionParams<K extends keyof SubscriptionMap> = {
    options: SubscriptionMap[K]["options"];
    disabled?: boolean;
    mergeHandler?: (
        prevData: SubscriptionMap[K]["dataType"] | null,
        newData: SubscriptionMap[K]["dataType"]
    ) => SubscriptionMap[K]["dataType"];
};

export const useWebsocketSubscription = <K extends keyof SubscriptionMap>(
    type: K,
    { options, disabled, mergeHandler }: UseWebsocketSubscriptionParams<K>
) => {
    const { status, lastMessage, subscribe, unsubscribe } = useContext(WebSocketContext)!;

    const [data, setData] = useState<SubscriptionMap[K]["dataType"] | null>(null);
    const [error, setError] = useState<ErrorMessage | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const subscriptionId = useRef(Math.random().toString(36).substr(2, 9)).current;
    const stableOptions = useMemo(() => options, [JSON.stringify(options)]);
    const mergeHandlerRef = useRef(mergeHandler);

    useEffect(() => {
        mergeHandlerRef.current = mergeHandler;
    }, [mergeHandler]);

    useEffect(() => {
        setIsLoading(!disabled);
    }, [type, stableOptions, disabled]);

    useEffect(() => {
        if (disabled) return;

        subscribe(subscriptionId, { [type]: stableOptions });

        return () => {
            unsubscribe(subscriptionId);
        };
    }, [type, stableOptions, disabled, status, subscribe, unsubscribe, subscriptionId]);

    useEffect(() => {
        if (!lastMessage || disabled) return;

        if (lastMessage.error) {
            setError(lastMessage.error);
            setIsLoading(false);
            return;
        }

        const payload = lastMessage[getResponseKey(type)];

        if (payload) {
            const newData = payload as SubscriptionMap[K]["dataType"];

            setData((prev) => mergeHandlerRef.current?.(prev, newData) ?? newData);
            setError(null);
            setIsLoading(false);
        }
    }, [lastMessage, type, disabled]);

    return { data, error, isLoading, connectionStatus: status };
};

const getResponseKey = (requestType: string): keyof ServerMessage => {
    switch (requestType) {
        case "subscribeMapFeatures":
            return "mapFeaturesUpdate";
        case "subscribeStopDepartures":
            return "stopDeparturesUpdate";
        case "subscribeTripUpdate":
            return "tripUpdateData";
        default:
            return "error";
    }
};
