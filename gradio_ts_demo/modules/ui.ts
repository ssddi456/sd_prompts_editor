import { Alert, Button, Col, getConfigFromContext, Input, Interface, Paragraph, Row } from "./components";

export interface ILayoutInfo {
    id: string | number;
    children?: ILayoutInfo[];
}

export interface IComponentInfo {
    type: string | string[];
    visible?: boolean;
    props?: any;
    valueProps?: string;
    value?: any;
}

export interface IActionsInfo {
    id: string | number;
    trigger: string;
    action: string;
    inputs: number[];
    outputs: number[];
}

export interface IRenderProps {
    components: Record<number, IComponentInfo>;
    layout: ILayoutInfo[];
    actions: IActionsInfo[];
}

export const temp_config: IRenderProps = {
    "components": {
        1: {
            "type": "Input",
            "props": {
                "placeholder": "Enter your name"
            }
        },

        2: {
            "type": "Button",
            "props": {
                "type": "primary",
                "children": "Submit"
            },
        },
        3: {
            "type": "Alert",
            "props": {
                "type": "success",
            },
            "valueProps": "message",
        },
    },
    layout: [
        { id: '1',},
        { id: '2',},
        { id: '3',},
    ],
    actions: [{
        id: '2',
        trigger: 'click',
        action: 'alert',
        inputs: [1],
        outputs: [3],
    }]
};

let text = new Input();
let submit = new Button('Submit');
let alert = new Alert();
let paragraph = new Paragraph({
    copyable: true,
});
const root = new Row([
    new Col([text]),
    new Col([submit]),
    new Col([alert]),
]);

submit.bind('click', (name: string) => {
    return [`hello world, ${name}`];
}, [text], [alert]);

// TODO: create a config from a function

// const config = getConfigFromContext(root);

const interfaceExample = new Interface((name: string) => {
    return [`hello world, ${name}`];
}, [text], [paragraph]);

const config = getConfigFromContext(interfaceExample);

export const getConfig = () => config;
