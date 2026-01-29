import { useState, useEffect, useRef } from "react";
import { fetchEventSource } from "@microsoft/fetch-event-source";
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
    const abortController = useRef<AbortController | null>(null);

    useEffect(() => {
        if (!enabled) {
            setIsLoading(false);
            return;
        }

        abortController.current = new AbortController();
        setIsLoading(true);
        setError(undefined);
        isFirstMessage.current = true;

        const connect = async () => {
            await fetchEventSource(apiBase + `/${city}/${endpoint}`, {
                headers: {
                    "Content-Type": "application/json",
                },
                signal: abortController.current?.signal,

                async onopen(response) {
                    if (response.ok) {
                        return;
                    } else {
                        const json = await response.json().catch(() => null);
                        setError(json?.error || "NETWORK_ERROR");
                    }
                },

                onmessage(msg) {
                    if (!msg.data) return;

                    const parsed = JSON.parse(msg.data);

                    if (hasInitialData && isFirstMessage.current) {
                        setInitialData(parsed as I);
                        isFirstMessage.current = false;
                        return;
                    }

                    setData(parsed as T);
                    setIsLoading(false);
                },

                onerror(err) {
                    setError(err.message || String(err));
                    setIsLoading(false);
                },

                onclose() {
                    setIsLoading(false);
                },
            });
        };

        connect();

        return () => {
            abortController.current?.abort();
            abortController.current = null;
        };
    }, [city, endpoint, enabled, hasInitialData]);

    return {
        data,
        initialData,
        isLoading,
        error,
    };
}
