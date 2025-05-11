import { useHookusPocusContext } from "../hookuspocus";

export default function useHookusRootUserdata<T>(this: void): [T, (this: void, value: T) => void] {
    let ctx = useHookusPocusContext()
    while (ctx.parent) ctx = ctx.parent;
    return [ctx.userdata, x => ctx.userdata = x];
}