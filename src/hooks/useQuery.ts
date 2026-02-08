import { useState, useEffect, useRef } from "react";
import EventSource from "react-native-sse";
import { apiBase } from "~/tools/constants";

type FetchQueryResult<T> = {
    data: T | undefined;
    isLoading: boolean;
    error?: string;
};

export function useFetchQuery<T = any>(
    city: string | undefined,
    endpoint: string,
    enabled: boolean = true,
): FetchQueryResult<T> {
    const [data, setData] = useState<T>();
    const [isLoading, setIsLoading] = useState<boolean>(enabled);
    const [error, setError] = useState<string>();

    const fetchedKey = useRef<string | null>(null);

    useEffect(() => {
        const key = `${city}/${endpoint}`;

        if (!enabled || !city) return;
        if (data && fetchedKey.current === key) return;

        const fetchData = async () => {
            fetchedKey.current = key;
            setIsLoading(true);
            setError(undefined);

            try {
                const response = await fetch(apiBase + `/${city}/${endpoint}`);
                const json = await response.json();

                if (json.error) {
                    setError(json.error);
                } else {
                    setData(json);
                }
            } catch (err) {
                console.error("Fetch error:", err);
                setError("NETWORK_ERROR");
            }

            setIsLoading(false);
        };

        fetchData();
    }, [city, endpoint, enabled, data]);

    return { data, isLoading, error };
}
type EventQueryOptions = {
    hasInitialData?: boolean;
    enabled?: boolean;
    resetDataOnKeyChange?: boolean;
};

type EventQueryResult<T, I> = {
    data: T | undefined;
    initialData: I | undefined;
    isLoading: boolean;
    error?: string;
};

export function useEventQuery<T = any, I = T>(
    city: string | undefined,
    endpoint: string,
    { hasInitialData = false, enabled = true, resetDataOnKeyChange = false }: EventQueryOptions = {},
): EventQueryResult<T, I> {
    const [data, setData] = useState<T>();
    const [initialData, setInitialData] = useState<I>();
    const [isLoading, setIsLoading] = useState<boolean>(enabled);
    const [error, setError] = useState<string>();

    const isFirstMessage = useRef(true);
    const startTimeRef = useRef<number | null>(null);
    const esRef = useRef<EventSource | null>(null);
    const prevEsRef = useRef<EventSource | null>(null);
    const keyRef = useRef<string | null>(null);

    useEffect(() => {
        if (!enabled || !city) {
            if (esRef.current) {
                esRef.current.removeAllEventListeners();
                esRef.current.close();

                esRef.current = null;
            }
            if (prevEsRef.current) {
                prevEsRef.current.removeAllEventListeners();
                prevEsRef.current.close();

                prevEsRef.current = null;
            }

            setIsLoading(false);
            return;
        }

        const key = `${city}/${endpoint}`;
        keyRef.current = key;

        setIsLoading(true);
        if (resetDataOnKeyChange) {
            setData(undefined);
            setInitialData(undefined);
        }
        startTimeRef.current = Date.now();
        setError(undefined);
        isFirstMessage.current = true;
        prevEsRef.current = esRef.current;

        const es = new EventSource(`${apiBase}/${city}/${endpoint}`, {
            timeoutBeforeConnection: 0,
            timeout: 0,
            pollingInterval: 0,
            method: "GET",
        });

        esRef.current = es;

        es.addEventListener("open", () => {
            if (prevEsRef.current && prevEsRef.current !== esRef.current) {
                prevEsRef.current.removeAllEventListeners();
                prevEsRef.current.close();

                prevEsRef.current = null;
            }
        });

        es.addEventListener("message", (event) => {
            if (event.type !== "message" || !event.data) return;

            const parsed = JSON.parse(event.data);

            if (parsed.error) {
                setError(parsed.error);
                setIsLoading(false);
                return es.close();
            }

            if (hasInitialData && isFirstMessage.current) {
                setInitialData(parsed as I);
                isFirstMessage.current = false;

                return;
            }

            if (startTimeRef.current !== null) {
                const elapsed = Date.now() - startTimeRef.current;
                // debug: ms until first data in `data` since hook registration
                console.debug(`useEventQuery ${keyRef.current} first data received in ${elapsed}ms`);
                startTimeRef.current = null;
            }

            setData(parsed as T);
            setIsLoading(false);
        });

        es.addEventListener("error", (event) => {
            setError("NETWORK_ERROR");
            setIsLoading(false);
            es.close();
        });

        return () => {
            if (es) {
                es.removeAllEventListeners();
                es.close();
            }

            if (esRef.current && esRef.current !== es) {
                esRef.current.removeAllEventListeners();
                esRef.current.close();

                esRef.current = null;
            }

            if (prevEsRef.current) {
                prevEsRef.current.removeAllEventListeners();
                prevEsRef.current.close();

                prevEsRef.current = null;
            }

            esRef.current = null;
            keyRef.current = null;
            startTimeRef.current = null;
        };
    }, [city, endpoint, enabled, hasInitialData]);

    return {
        data,
        initialData,
        isLoading,
        error,
    };
}
