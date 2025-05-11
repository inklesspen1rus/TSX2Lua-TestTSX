import { useHookusPocusContext } from "../hookuspocus";

export default function useHookusUserdata<T>(this: void): [T, (this: void, value: T) => void] {
    let ctx = useHookusPocusContext()
    while (ctx.parent) ctx = ctx.parent;
    return [ctx.userdata, x => ctx.userdata = x];
}