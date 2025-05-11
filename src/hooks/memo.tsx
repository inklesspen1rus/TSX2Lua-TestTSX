import { useState } from "./state";

export default function useMemo<F extends () => any>(this: void, func: F, deps: any[]): ReturnType<F> {
    const [state] = useState({
        deps: undefined as unknown as any[],
        result: undefined as unknown as ReturnType<F>,
    })

    if (state.deps === undefined || state.deps.length !== deps.length || !deps.every((x, k) => state.deps[k] === x)) {
        state.deps = deps;
        state.result = func();
    }

    return state.result;
}