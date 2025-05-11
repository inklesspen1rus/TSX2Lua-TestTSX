import { useHookusPocusReducer } from "../hookuspocus";

function useReducer<S, A, G>(reducer: (state: S, action: A) => S, initialArg: G, initer: (this: void, arg: G) => S): [S, (action: A) => void] {
    return useHookusPocusReducer(reducer, () => initer(initialArg))
}

export default useReducer;