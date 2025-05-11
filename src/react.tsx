import { HookusPocusContext } from "./hookuspocus"

export type ReactHookusContext = {
    userdata?: any
}

export interface Node<P extends {} = any> {
    component: Component<P>;
    props?: Omit<P, 'children'>;
    children?: Node[];
    render?: () => void;
};
export type Component<P extends {} = {}> = (this: void, props: Readonly<P & { children?: Node[], key?: any }>) => void | Node | Node[]

let idx = 0

export default class React {
    public static create<P extends {}>(component: Component<P>, props?: Omit<P, "children"> & any, ...children: Node[]): Node<P> {
        return {
            component,
            props,
            children: children.length > 0 ? children : undefined,
        };
    }

    public static readonly Fragment: Component<any> = ({ children }) => children;
}

interface VNode {
    component?: Component;
    context: HookusPocusContext<ReactHookusContext>;
    children?: VNode[];
    keyedChildren?: Map<AnyNotNil, VNode>;
};

function isVNode(value: any): value is VNode {
    return !!value?.component;
}

export class ReactContext<T> {
    public root: VNode;

    constructor(userdata: T, updateRequester: (this: void) => void) {
        this.root = {
            context: new HookusPocusContext({
                userdata: userdata
            }, updateRequester),
        }
    }

    public execute(node: Node) {
        this.root.context.invoke(() => this.executeInParent([node], this.root))
    }

    public executeInParent(nodes: Node[], parent: VNode) {
        const oldChildren = (parent.children ??= []);

        const keys = nodes
            .map(x => x.props?.key as AnyNotNil)
            .filter(x => x !== undefined);

        if (parent.keyedChildren) {
            const map = parent.keyedChildren;
            for (let k of map.keys()) {
                if (keys.indexOf(k) === -1) {
                    this.destroyVNode(map.get(k)!)
                }
            }
        } else if (keys.length !== 0) {
            parent.keyedChildren = new Map();
        }

        for (const deleted of oldChildren.splice(nodes.length - keys.length)) {
            this.destroyVNode(deleted)
        }

        let idx = 0
        for (const node of nodes) {
            const key = node.props?.key;
            let vnode = (key !== undefined)
                ? parent.keyedChildren!.get(node.props!.key)
                : oldChildren[idx++];

            if (node.component !== vnode?.component) {
                const deletedChildren = (key !== undefined)
                    ? [parent.keyedChildren!.get(key)!]
                    : oldChildren.splice(idx)

                for (const deleted of deletedChildren) {
                    this.destroyVNode(deleted)
                }

                vnode = {
                    context: parent.context.createChild({}),
                    component: node.component,
                }

                if (key !== undefined)
                    parent.keyedChildren!.set(key, vnode);
                else
                    oldChildren.push(vnode)
            }

            const ret = vnode.context.invoke(node.component, { ...(node.props || {}), children: node.children })
            if (ret) {
                if (isVNode(ret)) {
                    this.executeInParent([ret as Node], vnode)
                } else {
                    this.executeInParent(ret as Node[], vnode)
                }
            } else {
                this.executeInParent([], vnode)
            }
        }
    }

    public destroyVNode(vnode: VNode) {
        for (const child of vnode.children || []) {
            this.destroyVNode(child)
        }
        if (vnode.keyedChildren) {
            for (const child of vnode.keyedChildren.values()) {
                this.destroyVNode(child)
            }
        }
        using _ = vnode.context
    }

    public [Symbol.dispose]() {
        this.destroyVNode(this.root)
    }
}