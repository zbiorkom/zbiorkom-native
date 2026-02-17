import { useState, useEffect, useRef } from "react";
import EventSource from "react-native-sse";
import { apiBase } from "~/tools/constants";

export type LoadingState = {
    loading?: boolean;
    error?: string;
};

type FetchQueryResult<T> = {
    data: T | undefined;
    loadingState?: LoadingState;
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

    return {
        data,
        loadingState: isLoading || error ? { loading: isLoading || undefined, error } : undefined,
    };
}
type EventQueryOptions = {
    enabled?: boolean;
    resetDataOnKeyChange?: boolean;
};

type EventQueryResult<T, I> = {
    data: T | undefined;
    initialData: I | undefined;
    loadingState?: LoadingState;
};

export function useEventQuery<T = any, I = T>(
    city: string | undefined,
    endpoint: string,
    { enabled = true, resetDataOnKeyChange = false }: EventQueryOptions = {},
): EventQueryResult<T, I> {
    const [data, setData] = useState<T>();
    const [initialData, setInitialData] = useState<I>();
    const [isLoading, setIsLoading] = useState<boolean>(enabled);
    const [error, setError] = useState<string>();

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
        setError(undefined);
        prevEsRef.current = esRef.current;

        const es = new EventSource<"initial" | "message" | "errorCode">(`${apiBase}/${city}/${endpoint}`, {
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

        es.addEventListener("initial", (event) => {
            setInitialData(JSON.parse(event.data!) as I);
        });

        es.addEventListener("message", (event) => {
            setData(JSON.parse(event.data!) as T);
            setIsLoading(false);
        });

        es.addEventListener("errorCode", (event) => {
            setError(event.data!);
            setIsLoading(false);
            es.close();
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
        };
    }, [city, endpoint, enabled]);

    return {
        data,
        initialData,
        loadingState: isLoading || error ? { loading: isLoading || undefined, error } : undefined,
    };
}
