export default function prettyPrint(x: any, tab: number = 0) {
    const tabb = string.rep('| ', tab);
    switch (type(x)) {
        case "table":
            print(tabb, '[object Object]');
            for (const [k, v] of Object.entries(x)) {
                print(tabb + 'key:', k);
                prettyPrint(v, tab + 1);
            }
            break;
        default:
            print(tabb + tostring(x));
    }
}
