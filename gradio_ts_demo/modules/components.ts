import { registerBridge } from "./bridge";
import { IComponentInfo, ILayoutInfo, IRenderProps } from "./ui";

let instanceId = 0;

export function walkContext(fn: (c: Component) => void, context: Component) {
    fn(context);
    context.children.forEach(c => walkContext(fn, c));
}

export function getConfigFromContext(root: Component) {
    
    const output:IRenderProps = {
        components: {},
        layout: [],
        actions: []
    };

    walkContext(c => {
        
        output.components[c.id] = c.serialize();

        if (c.triggers) {
            c.triggers.forEach(({trigger, action, inputs, outputs}) => {
                output.actions.push({
                    id: c.id,
                    trigger,
                    action,
                    inputs: inputs.map(i => i.id),
                    outputs: outputs.map(o => o.id),
                });
            });
        }
    }, root);

    output.layout = [root.getLayoutInfo()];
    return output;
}

export class Component {
    id: number;
    parent: Component | null = null;
    triggers: {
        trigger: string;
        action: string;
        inputs: Component[];
        outputs: Component[];
    }[] = [];
    constructor(public type: string, public children: Component[] = []) {
        this.id = instanceId++;
    }

    bind(event: string, fn: (...args: any[]) => any, inputs: Component[], outputs: Component[]) {
        const method = `${this.id}_${event}`;
        registerBridge(method, fn);
        this.triggers.push({
            trigger: event,
            action: method,
            inputs,
            outputs,
        });
    }

    getLayoutInfo(): ILayoutInfo {
        if (this.children.length === 0) {
            return {
                id: this.id,
            };
        }
        return {
            id: this.id,
            children: this.children.map(c => c.getLayoutInfo()),
        };
    }

    serialize(): IComponentInfo {
        return {
            type: this.type,
            props: {},
        };
    }
}


export class Row extends Component {
    constructor(children: Component[] = []) {
        super('Row', children);
    }
}

export class Col extends Component {
    constructor(children: Component[] = []) {
        super('Col', children);
    }
}

export class Input extends Component {
    constructor() {
        super('Input');
    }
}

export class Button extends Component {
    constructor(public text: string) {
        super('Button');
    }
    serialize(): IComponentInfo {
        return {
            type: this.type,
            props: {
                children: this.text,
            },
        };
    }
}

export class Alert extends Component {
    constructor() {
        super('Alert');
    }

    serialize(): IComponentInfo {
        return {
            type: this.type,
            props: {},
            valueProps: 'message',
        };
    }
}