
export const bridgeMap: Record<string, (...args: any[]) => Promise<any> | any> = {};

export function registerBridge(name: string, fn: (...args: any[]) => Promise<any> | any) {
    bridgeMap[name] = fn;
}

registerBridge('alert', (name: string) => {
    return [`hello world, ${name}`];
});