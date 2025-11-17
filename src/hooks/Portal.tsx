import { Fragment, useEffect, useId } from "react";
import { useShallow } from "zustand/shallow";
import { create } from "zustand";

type PortalElement = {
    id: string;
    element: React.ReactNode;
};

interface PortalState {
    hosts: { [id: string]: PortalElement[] | undefined };
    addElement: (hostId: string, id: string, element: React.ReactNode) => void;
    removeElement: (hostId: string, id: string) => void;
}

export const usePortalStore = create<PortalState>((set) => ({
    hosts: {},
    addElement: (host, id, element) => {
        set((state) => ({
            hosts: {
                ...state.hosts,
                [host]: [...(state.hosts[host] || []), { id, element }],
            },
        }));
    },
    removeElement: (host, id) => {
        set((state) => {
            const hostElements = state.hosts[host];
            if (!hostElements) return state;

            return {
                hosts: {
                    ...state.hosts,
                    [host]: hostElements.filter((el) => el.id !== id),
                },
            };
        });
    },
}));

export const Portal = ({ host, children }: { host: string; children: React.ReactNode }) => {
    const [addElement, removeElement] = usePortalStore(
        useShallow((state) => [state.addElement, state.removeElement])
    );

    const id = useId();

    useEffect(() => {
        addElement(host, id, children);

        return () => {
            removeElement(host, id);
        };
    }, [id, children, addElement, removeElement, host]);

    return null;
};

export const Host = ({ host }: { host: string }) => {
    const elements = usePortalStore(useShallow((state) => state.hosts[host]));

    return elements?.map((el) => <Fragment key={el.id}>{el.element}</Fragment>);
};
