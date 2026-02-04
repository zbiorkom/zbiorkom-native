import { useState, useEffect, useRef } from "react";
import EventSource from "react-native-sse";
import { apiBase } from "~/tools/constants";

type FetchQueryResult<T> = {
    data: T | undefined;
    isLoading: boolean;
    error?: string;
};

export function useFetchQuery<T = any>(
    city: string,
    endpoint: string,
    enabled: boolean = true,
): FetchQueryResult<T> {
    const [data, setData] = useState<T>();
    const [isLoading, setIsLoading] = useState<boolean>(enabled);
    const [error, setError] = useState<string>();

    const fetchedKey = useRef<string | null>(null);

    useEffect(() => {
        const key = `${city}/${endpoint}`;

        if (!enabled) return;
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
};

type EventQueryResult<T, I> = {
    data: T | undefined;
    initialData: I | undefined;
    isLoading: boolean;
    error?: string;
};

export function useEventQuery<T = any, I = T>(
    city: string,
    endpoint: string,
    { hasInitialData = false, enabled = true }: EventQueryOptions = {},
): EventQueryResult<T, I> {
    const [data, setData] = useState<T>();
    const [initialData, setInitialData] = useState<I>();
    const [isLoading, setIsLoading] = useState<boolean>(enabled);
    const [error, setError] = useState<string>();

    const isFirstMessage = useRef(true);
    const esRef = useRef<EventSource | null>(null);

    useEffect(() => {
        if (!enabled) {
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        setError(undefined);
        isFirstMessage.current = true;

        const es = new EventSource(`${apiBase}/${city}/${endpoint}`, {
            pollingInterval: 0,
            method: "GET",
        });

        esRef.current = es;

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

            setData(parsed as T);
            setIsLoading(false);
        });

        es.addEventListener("error", (event) => {
            console.error("EventSource error:", event);

            setError("NETWORK_ERROR");
            setIsLoading(false);
            es.close();
        });

        return () => {
            es.removeAllEventListeners();
            es.close();
            esRef.current = null;
        };
    }, [city, endpoint, enabled, hasInitialData]);

    return {
        data,
        initialData,
        isLoading,
        error,
    };
}
