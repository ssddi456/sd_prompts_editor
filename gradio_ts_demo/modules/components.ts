import { registerBridge } from "./bridge";
import { IComponentInfo, ILayoutInfo, IRenderProps } from "./ui";

let instanceId = 0;

interface IPropsBase {
    style?: Record<string, string>;
}

export function walkContext(fn: (c: Component) => void, context: Component) {
    fn(context);
    context.children.forEach(c => walkContext(fn, c));
}

export function getConfigFromContext(root: Component) {

    const output: IRenderProps = {
        components: {},
        layout: [],
        actions: []
    };

    walkContext(c => {

        output.components[c.id] = c.serialize();

        if (c.triggers) {
            c.triggers.forEach(({ trigger, action, inputs, outputs }) => {
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
    props: any;
    triggers: {
        trigger: string;
        action: string;
        inputs: Component[];
        outputs: Component[];
    }[] = [];
    constructor(public type: string | string[], public children: Component[] = []) {
        this.id = instanceId++;
    }

    bind(event: string, fn: (...args: any[]) => any, inputs: Component[], outputs: Component[]) {
        const method = `${this.id}_${event}_${this.triggers.length}_${fn.name}`;
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
            props: this.props || {},
        };
    }
}


export class Row extends Component {
    constructor(children: Component[] = [], public props: Partial<{ gutter: number, } & IPropsBase> = {}) {
        super('Row', children);
    }
}

export class Col extends Component {
    constructor(children: Component[] = [], public props: Partial<{ span: number } & IPropsBase> = {}) {
        super('Col', children);
    }
}

export class Input extends Component {
    constructor() {
        super('Input');
    }
}

export class TextArea extends Component {
    constructor() {
        super('TextArea');
    }
}

export class Card extends Component {
    constructor(children: Component[] = [], public props: Partial<{ title: string } & IPropsBase> = {}) {
        super('Card', children);
    }

    serialize(): IComponentInfo {
        return {
            type: this.type,
            props: {
                ...this.props,
            },
        };
    }
}

export class Button extends Component {
    constructor(public text: string, public props: Partial<{ type: string, size: string } & IPropsBase> = {}) {
        super('Button');
    }
    serialize(): IComponentInfo {
        return {
            type: this.type,
            props: {
                ...this.props,
                children: this.text,
            },
        };
    }
}

export class Alert extends Component {
    constructor(public props: Partial<{ type: string, size: string } & IPropsBase> = {}) {
        super('Alert');
    }

    serialize(): IComponentInfo {
        return {
            type: this.type,
            props: this.props || {},
            valueProps: 'message',
        };
    }
}

export class Paragraph extends Component {
    constructor(public props: Partial<{ copyable: any } & IPropsBase> = {}) {
        super(['Typography', 'Paragraph']);
    }
    serialize(): IComponentInfo {
        return {
            type: this.type,
            props: this.props || {},
            valueProps: 'children',
        };
    }
}

export class Interface extends Component {
    button_submit: Button;
    button_reset: Button;
    constructor(public method: (...args: any[]) => any, public inputs: Component[], public outputs: Component[]) {
        super('div');

        this.button_submit = new Button('Submit');
        this.button_reset = new Button('Reset');
        this.button_submit.bind('click', method, inputs, outputs);
        this.button_reset.bind('click', () => {
            return [...inputs, ...outputs].map(i => {
                return '';
            });
        }, [], [...inputs, ...outputs]);


        this.children = [
            new Row([
                new Col([
                    new Card([
                        ...this.inputs.map(i => new Row([new Col([i])])),
                        new Row([
                            new Col([this.button_submit]),
                            new Col([this.button_reset]),
                        ], {
                            gutter: 16,
                            style: {
                                marginTop: '16px',
                            },
                        }),
                    ], { title: 'Input' }),
                ], { span: 12 }),
                new Col([
                    new Card([
                        ...this.outputs.map(o => new Row([new Col([o])])),
                    ], { title: 'Output' }),
                ], { span: 12 }),
            ], { gutter: 16 })
        ];
    }
}