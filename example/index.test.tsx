import { createContext } from "../src/hookuspocus";
import { useState } from "../src/hooks/state";
import { useEffect } from "../src/hooks/effect";

declare namespace JSX {
    type IntrinsicElements = {};
}

import Leact, { LeactContext } from "../src/leact";
import useMemo from "../src/hooks/memo";

let needUpdate = false

const reactContext = new LeactContext(undefined, () => needUpdate = true)

function WithEffect(this: void) {
    print('Call with effect')
    useMemo(() => print('Expensive call'), [])
    useEffect(() => {
        print('Im here')
        return () => print('Good bye')
    }, [])
}

function WithHooks(this: void, {init}: {init: number}) {
    const countUpTo = 5
    const [count, setCount] = useState(init)
    const [stableState, _] = useState('unchanged')
    print(`Function was called ${count} times. Stable state: ${stableState}`)
    setCount(Math.min(countUpTo, count + 1))

    useEffect(() => {
        print(`Effecting with value ${count}`)
        return () => print(`Cleaned up with value ${count}`)
    }, [])
    
    return (count % 2 == 0) ? <WithEffect></WithEffect> : undefined
}

function Main(this: void) {
    return <WithHooks init={1}></WithHooks>
};

do {
    needUpdate = false;
    reactContext.execute(<Main></Main>)
} while (needUpdate);

{using _ = reactContext}
