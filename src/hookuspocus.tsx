const runStack: HookusPocusContext[] = [];

const UNDEFINED = {}

export type CallbackTypes = {
    before: (this: void) => void;
    after: <T>(this: void) => void;
    ['global.before']: (this: void) => void;
    ['global.after']: <T>(this: void) => void;
}

export class HookusPocusContext<T = any> {
    public userdata: T;
    public parent?: HookusPocusContext;

    public datas: any[] = [];
    public currentIndex: number = -1;
    public maxIndex: number = -1;
    public cleanUps: Array<() => void> = [];
    public updateRequester?: (this: void) => void = undefined;
    public callbacks: Map<keyof CallbackTypes, CallbackTypes[keyof CallbackTypes][]> = new Map();
    
    constructor(userdata: T, requestUpdate?: (this: any) => void, parent?: HookusPocusContext) {
        this.userdata = userdata;
        this.parent = parent;
        this.updateRequester = requestUpdate;
    }

    public createChild<T = void>(userdata: T): HookusPocusContext<T> {
        return new HookusPocusContext(userdata, undefined, this)
    }

    public [Symbol.dispose]() {
        this.cleanUps.forEach(x => x())
    }

    public requestUpdate() {
        if (this.parent) this.parent.requestUpdate();
        else this.updateRequester!();
    }

    public on<K extends keyof CallbackTypes>(key: K, func: CallbackTypes[K]) {
        if (this.parent && key.startsWith('global.'))
            this.parent.on(key, func)
        else {
            key = (key.startsWith('global.') && key.slice(7) || key) as any
            
            const callbacks = this.callbacks.get(key)
            if (callbacks !== undefined) callbacks.push(func)
            else this.callbacks.set(key, [func])
        }
    }

    public emit<K extends keyof CallbackTypes>(key: K): void {
        const callbacks = this.callbacks.get(key)
        
        if (callbacks) {
            this.callbacks.delete(key)
            for (const func of callbacks as CallbackTypes[K][])
                func()
        }
    }

    public invoke<F extends (this: void, ...args: any[]) => any>(func: F, ...args: Parameters<F>): ReturnType<F> {
        this.currentIndex = 0;
        runStack.push(this);

        if (runStack.length == 1) this.emit('global.before')
        this.emit('before')

        let r = func(...args)

        this.emit('after')
        if (runStack.length == 1) this.emit('global.after')

        runStack.push(this);

        return r
    }
}

export const useHookusPocusReducer = <S, A>(reducer: (state: S, action: A) => S, initer: () => S): [S, (action: A) => void] => {
    const ctx = runStack[runStack.length - 1];
    const index = ctx.currentIndex++;

    if (index > ctx.maxIndex) {
        ctx.maxIndex = index
        ctx.datas[index] = initer()
    }

    // Lua workaround
    const val = ctx.datas[index] === UNDEFINED
        ? undefined
        : ctx.datas[index]
    
    const sharedState = { inFunc: true }
    
    return [
        val,
        (x: A) => {
            const newValue = reducer(val, x)
            if (newValue !== val) {
                ctx.datas[index] = newValue ?? UNDEFINED
                if (sharedState.inFunc)
                    ctx.requestUpdate()
            }
        }
    ]
}

export function useHookusPocusContext() {
    return runStack[runStack.length - 1];
}

export function destroyPocus<T>(context: HookusPocusContext<T>) {
    using _ = context;
}

export function createContext<T>(userdata: T, requestUpdate: () => void): HookusPocusContext<T> {
    return new HookusPocusContext(userdata, requestUpdate)
}

export interface WrappedPocus<T, F extends (...args: any[]) => any> {
    context: HookusPocusContext<T>;
    destroy(): void;
    (...args: Parameters<F>): ReturnType<F>;
}
