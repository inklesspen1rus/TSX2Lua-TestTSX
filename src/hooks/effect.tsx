import { useHookusPocusContext } from "../hookuspocus"
import { useState } from "./state";

type EffectFunc = (this: void) => ((this: void) => void) | void

export function useEffect(this: void, func: EffectFunc, deps?: any[]) {
    const state = useState<{deps?: typeof deps, cleanup?: (this: void, local?: boolean) => void}>({})[0]
    const old = state.deps
    state.deps = deps

    // Did deps changed? Or there is undefined? Should we go?
    if (old !== undefined && deps !== undefined) {
        if (deps === old) return;

        if (old !== undefined
            && old.length == deps.length
            && deps.every((x, k) => old[k] === x))
            return; // return if deps aren't changed
    }

    state.deps = deps
    state.cleanup?.(true);
    state.cleanup = undefined;

    const ctx = useHookusPocusContext()
    const sharedState = { destroyed: false } as {
        destroyed: boolean,
    };

    function onCleanUp(this: void) {
        sharedState.destroyed = true
    }
    ctx.cleanUps.push(onCleanUp)

    ctx.on('global.after', () => {
        if (!sharedState.destroyed) {
            const cleanUpIdx = ctx.cleanUps.indexOf(onCleanUp)
            ctx.cleanUps.splice(cleanUpIdx, 1)

            const ret = func()
            const cleanup = ret && function(this: void, local?: boolean) {
                ret()
            }

            if (cleanup)
            {
                ctx.cleanUps.push(cleanup)
                state.cleanup = cleanup
            }
        }
    });
}