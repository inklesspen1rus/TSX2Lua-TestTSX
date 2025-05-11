import { useHookusPocusContext } from "../hookuspocus";

export default function useRootUserdata<T>(this: void): T {
    let ctx = useHookusPocusContext()
    while (ctx.parent) ctx = ctx.parent;
    return ctx.userdata;
}