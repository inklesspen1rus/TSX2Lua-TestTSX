import { useHookusPocusReducer } from "../hookuspocus";

export function useState<S>(this: void, initState: S) {
    return useHookusPocusReducer<S, S>((_, s) => s, () => initState)
}