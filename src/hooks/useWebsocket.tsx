import React, { createContext, useContext, useEffect, useRef, useState, useCallback, useMemo } from "react";
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

// Konfiguracja
const PING_INTERVAL = 10000;
const BACKGROUND_TIMEOUT = 15000; // Czas po którym zamykamy socket w tle

export enum ConnectionStatus {
    DISCONNECTED,
    CONNECTING,
    CONNECTED,
}

// Prosty typ listenera
type MessageListener = (msg: ServerMessage) => void;

interface WebSocketContextType {
    status: ConnectionStatus;
    send: (msg: ClientMessage) => void;
    addListener: (listener: MessageListener) => () => void; // Zwraca funkcję usuwającą listener
}

const WebSocketContext = createContext<WebSocketContextType | null>(null);

export const WebSocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [status, setStatus] = useState<ConnectionStatus>(ConnectionStatus.DISCONNECTED);
    
    const socketRef = useRef<WebSocket | null>(null);
    const listenersRef = useRef<Set<MessageListener>>(new Set());
    const appStateRef = useRef<AppStateStatus>(AppState.currentState);
    
    const pingTimer = useRef<number | null>(null);
    const backgroundTimer = useRef<number | null>(null);
    const reconnectTimer = useRef<number | null>(null);

    // --- Zarządzanie połączeniem ---

    const startPing = useCallback(() => {
        if (pingTimer.current) clearInterval(pingTimer.current);
        pingTimer.current = setInterval(() => {
            if (socketRef.current?.readyState === WebSocket.OPEN) {
                try {
                    socketRef.current.send("ping");
                } catch (e) {
                    // Ignorujemy błędy pinga
                }
            }
        }, PING_INTERVAL);
    }, []);

    const stopPing = useCallback(() => {
        if (pingTimer.current) {
            clearInterval(pingTimer.current);
            pingTimer.current = null;
        }
    }, []);

    const disconnect = useCallback(() => {
        if (socketRef.current) {
            socketRef.current.onclose = null; // Usuwamy handler, by nie triggerować reconnectu
            socketRef.current.onmessage = null;
            socketRef.current.onerror = null;
            socketRef.current.close();
            socketRef.current = null;
        }
        stopPing();
        setStatus(ConnectionStatus.DISCONNECTED);
    }, [stopPing]);

    const connect = useCallback(() => {
        if (socketRef.current?.readyState === WebSocket.OPEN || socketRef.current?.readyState === WebSocket.CONNECTING) {
            return;
        }

        const ws = new WebSocket(apiBase.replace("http", "ws") + "/ws");
        ws.binaryType = "arraybuffer";

        setStatus(ConnectionStatus.CONNECTING);

        ws.onopen = () => {
            setStatus(ConnectionStatus.CONNECTED);
            startPing();
            console.log("WS Connected");
        };

        ws.onmessage = (event) => {
            if (event.data === "pong") return;
            
            if (event.data instanceof ArrayBuffer) {
                try {
                    const deserializer = new CompactDeserializer(event.data);
                    const msg = deserializer.unpack(ServerMessage) as ServerMessage;
                    
                    if (msg) {
                        // Iterujemy po kopii zestawu, żeby uniknąć błędów przy dodawaniu/usuwaniu w trakcie pętli
                        listenersRef.current.forEach(listener => listener(msg));
                    }
                } catch (e) {
                    console.error("WS Parse Error", e);
                }
            }
        };

        ws.onclose = () => {
            stopPing();
            socketRef.current = null;
            setStatus(ConnectionStatus.DISCONNECTED);

            // Auto-reconnect tylko jeśli aplikacja jest aktywna
            if (appStateRef.current === "active") {
                reconnectTimer.current = setTimeout(connect, 3000);
            }
        };

        ws.onerror = (e) => {
            console.log("WS Error", e);
        };

        socketRef.current = ws;
    }, [startPing, stopPing]);

    // --- API Contextu ---

    const send = useCallback((msg: ClientMessage) => {
        if (socketRef.current?.readyState === WebSocket.OPEN) {
            try {
                socketRef.current.send(JSON.stringify(msg));
            } catch (e) {
                console.error("Send failed", e);
            }
        }
    }, []);

    const addListener = useCallback((listener: MessageListener) => {
        listenersRef.current.add(listener);
        return () => {
            listenersRef.current.delete(listener);
        };
    }, []);

    // --- AppState (Tło) ---

    useEffect(() => {
        const subscription = AppState.addEventListener("change", (nextAppState) => {
            const prevAppState = appStateRef.current;
            appStateRef.current = nextAppState;

            // Idzie w tło -> zaplanuj rozłączenie
            if (prevAppState === "active" && nextAppState.match(/inactive|background/)) {
                backgroundTimer.current = setTimeout(disconnect, BACKGROUND_TIMEOUT);
            }

            // Wraca -> anuluj rozłączenie i połącz jeśli trzeba
            if (prevAppState.match(/inactive|background/) && nextAppState === "active") {
                if (backgroundTimer.current) {
                    clearTimeout(backgroundTimer.current);
                    backgroundTimer.current = null;
                }
                if (!socketRef.current) {
                    connect();
                }
            }
        });

        // Startowe połączenie
        connect();

        return () => {
            subscription.remove();
            if (backgroundTimer.current) clearTimeout(backgroundTimer.current);
            if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
            disconnect();
        };
    }, [connect, disconnect]);

    const value = useMemo(() => ({ status, send, addListener }), [status, send, addListener]);

    return (
        <WebSocketContext.Provider value={value}>
            {children}
        </WebSocketContext.Provider>
    );
};

export const useConnectionStatus = () => useContext(WebSocketContext)!.status;


// --- NOWY, UPROSZCZONY HOOK ---

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
    options?: SubscriptionMap[K]["options"];
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
    const { status, send, addListener } = useContext(WebSocketContext)!;

    const [data, setData] = useState<SubscriptionMap[K]["dataType"] | null>(null);
    const [error, setError] = useState<ErrorMessage | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    // Zapamiętujemy handler, żeby nie wchodził do dependencies
    const mergeHandlerRef = useRef(mergeHandler);
    useEffect(() => { mergeHandlerRef.current = mergeHandler; }, [mergeHandler]);

    // Stabilizacja opcji
    const stableOptions = useMemo(() => options, [JSON.stringify(options)]);

    // Główna logika
    useEffect(() => {
        if (disabled) {
            setIsLoading(false);
            return;
        }

        setIsLoading(true);

        // 1. Definicja listenera: co robimy jak przyjdą dane
        const handleMessage = (msg: ServerMessage) => {
            if (msg.error) {
                // Opcjonalnie: można sprawdzać czy error jest "nasz", ale w prostym modelu bierzemy wszystkie
                setError(msg.error); 
                setIsLoading(false);
                return;
            }

            const responseKey = getResponseKey(type);
            const payload = msg[responseKey];

            if (payload) {
                const newData = payload as SubscriptionMap[K]["dataType"];
                setData(prev => mergeHandlerRef.current ? mergeHandlerRef.current(prev, newData) : newData);
                setError(null);
                setIsLoading(false);
            }
        };

        // 2. Dodaj listenera do Providera
        const removeListener = addListener(handleMessage);

        // 3. Wyślij subskrypcję JEŚLI jesteśmy połączeni
        //    (Provider zajmuje się tylko transportem, Hook decyduje kiedy wysłać)
        if (status === ConnectionStatus.CONNECTED) {
            send({ [type]: stableOptions });
        }

        // 4. Cleanup: tylko usuwamy listenera. 
        //    NIE wysyłamy "unsubscribe" do serwera, bo to może ubić dane na innym ekranie.
        return () => {
            removeListener();
        };

    }, [type, stableOptions, disabled, status, send, addListener]); 
    // ^ Zależność od `status` jest KLUCZOWA. Jak socket się połączy (CONNECTING -> CONNECTED), 
    //   efekt się odpali ponownie i wyśle `send`.

    // USUNIĘTO: useEffect czyszczący dane (setData(null)). 
    // To naprawia migotanie. Stare dane zostaną, dopóki nie przyjdą nowe.

    return { data, error, isLoading, connectionStatus: status };
};

const getResponseKey = (requestType: string): keyof ServerMessage => {
    switch (requestType) {
        case "subscribeMapFeatures": return "mapFeaturesUpdate";
        case "subscribeStopDepartures": return "stopDeparturesUpdate";
        case "subscribeTripUpdate": return "tripUpdateData";
        default: return "error";
    }
};