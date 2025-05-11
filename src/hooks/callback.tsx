import useMemo from "./memo";

export default function useCallback<F>(this: void, func: F, deps: any[]) {
    return useMemo(() => func, deps)
}