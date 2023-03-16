
function rpc(url: string, data: any) {
    return new Promise<any>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', url);
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.onload = () => {
            if (xhr.status === 200) {
                resolve(JSON.parse(xhr.responseText));
            } else {
                reject(xhr.response);
            }
        };
        xhr.onerror = () => {
            reject(xhr.response);
        };
        xhr.send(JSON.stringify(data));
    });
}

function wrapRpc(funcName: string,) {
    return async (data: any) => {
        const res = await rpc(`/api/${funcName}`, data);
        if (res.error) {
            throw new Error(res.message);
        }
        return res.data;
    };
}

function bootstrapApp(config: any) {
    const React = window.React;
    const ReactDOM = window.ReactDOM;
    const antd = window.antd;

    const elRefs: Record<number | string, React.Component> = {};

    const eventQueue: Promise<any>[] = [];

    const addEvent = (e, event: import('./ui').IActionsInfo) => {
        if (eventQueue.length === 0) {
            const promise = processEvent(e, event);
            eventQueue.push(promise);
            promise.then(() => {
                eventQueue.splice(eventQueue.indexOf(promise), 1);
            });
            return promise;
        } else {
            const trackPromise = new Promise<void>(async (resolve) => {
                await eventQueue[eventQueue.length - 1];
                await processEvent(e, event);
                eventQueue.splice(eventQueue.indexOf(trackPromise), 1);
                resolve();
            });
            eventQueue.push(trackPromise);
        }
    };

    async function processEvent(e, event: import('./ui').IActionsInfo) {
        const inputItemIds = event.inputs || {};
        const inputValues: any[] = [];
        inputItemIds.forEach((inputItemId) => {
            const inputEl = elRefs[inputItemId];
            const inputValue = inputEl.state.value;
            inputValues.push(inputValue);
        });
        try {
            const ret: any[] = await wrapRpc(event.action)(inputValues);
            console.log('processEvent', event, inputValues, ret);
            const outputEl = event.outputs || [];
            outputEl.forEach((outputItemId, idx) => {
                const outputEl = elRefs[outputItemId];
                outputEl.setState({
                    value: ret[idx],
                });
            });
        } catch (error) {
            console.error(error);
        }
    }

    class Render extends React.Component {
        state: { value: any };
        constructor(props: any) {
            super();
            const { value } = props;
            this.state = {
                value,
            }
        }

        render() {
            const { id, type, props, valueProps, value } = this.props;
            const Component = antd[type];
            const realProps = {
                ...props,
            };

            realProps[valueProps || 'value'] = this.state.value;

            const triggers = this.props.triggers || {};

            for (let key in triggers) {
                const triggerKey = `on${key[0].toUpperCase()}${key.slice(1)}`;
                realProps[triggerKey] = (e) => {
                    triggers[key].forEach((event: import('./ui').IActionsInfo) => {
                        addEvent(e, event);
                    });
                };
            }

            return (
                <Component
                    {...realProps}
                    onChange={(e) => {
                        this.setState({
                            value: e?.target ? e?.target.value : e,
                        });
                    }}
                />
            );
        }
    }

    class Blocks extends React.Component<import('./ui').ILayoutInfo[]> {
        createComponentConfig(layoutItem: import('./ui').ILayoutInfo) {
            const { id } = layoutItem;
            const componentConfig = config.components[id];
            const events = config.actions.filter((action: import('./ui').IActionsInfo) => action.id === id);

            const ret = {
                ...componentConfig,
            };

            const triggers: Record<string, import('./ui').IActionsInfo[]> = {};
            events.forEach((event: import('./ui').IActionsInfo) => {
                triggers[event.trigger] = triggers[event.trigger] || [];
                triggers[event.trigger].push(event);
            });
            ret.triggers = triggers;
            return ret;
        }

        render() {
            const items = this.props.config || [];
            return (
                items.map((item: import('./ui').ILayoutInfo) => {
                    const itemConfig = this.createComponentConfig(item);
                    const children = item.children ? <Blocks config={item.children} /> : null;
                    if (children) {
                        itemConfig.props = itemConfig.props || {};
                        itemConfig.props.children = children;
                    }
                    return (
                        <Render
                            {...itemConfig}
                            id={item.id}
                            ref={(el) => {
                                elRefs[item.id] = el;
                            }}
                        />
                    );
                })
            );
        }
    }

    class App extends React.Component {
        render() {

            if (!window.gradio_ts_demo_config) {
                return (
                    <div>
                        <h1>Gradio TS Demo</h1>
                        <p>Gradio TS Demo</p>
                        <p>gradio_ts_demo_config not set</p>
                    </div>
                );
            }
            return (
                <div>
                    <h1>Gradio TS Demo</h1>
                    <p>Gradio TS Demo</p>
                    <Blocks config={config.layout} />
                </div>
            );
        }
    }

    ReactDOM.render(<App />, document.getElementById('gradio_ts_demo'));
}

window.gradio_ts_demo = {
    init: () => {
        let moduleLoadMap: Record<string, { script?: string, style?: string, ready: boolean }> = {
            'antdScript': {
                script: 'https://cdn.bootcdn.net/ajax/libs/antd/4.16.13/antd.min.js',
                ready: false,
            },
            'antdStyle': {
                style: 'https://cdn.bootcdn.net/ajax/libs/antd/4.16.13/antd.min.css',
                ready: false,
            },
            'reactScript': {
                script: 'https://cdn.bootcdn.net/ajax/libs/react/17.0.2/umd/react.development.min.js',
                ready: false,
            },
            'reactDomScript': {
                script: 'https://cdn.bootcdn.net/ajax/libs/react-dom/17.0.2/umd/react-dom.development.min.js',
                ready: false,
            },
        };

        function allReady() {
            for (let key in moduleLoadMap) {
                if (!moduleLoadMap[key].ready) {
                    return false;
                }
            }
            return true;
        }

        function partOk(key: string) {
            moduleLoadMap[key].ready = true;
            if (allReady()) {
                setTimeout(() => {
                    bootstrapApp(window.gradio_ts_demo_config);
                }, 100);
            }
        }

        for (let key in moduleLoadMap) {
            let item = moduleLoadMap[key];
            if (item.script) {
                let script = document.createElement('script');
                script.src = item.script;
                script.crossOrigin = 'anonymous';
                script.onload = () => {
                    partOk(key);
                };
                document.head.appendChild(script);
            } else if (item.style) {
                let style = document.createElement('link');
                style.href = item.style;
                style.rel = 'stylesheet';
                style.crossOrigin = 'anonymous';
                style.onload = () => {
                    partOk(key);
                };
                document.head.appendChild(style);
            }
        }
    }
};
