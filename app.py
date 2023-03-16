import json
import gradio as gr

def greet(name: list):
    return "Hello " + json.dumps(name) + "!"

namelist = gr.List(None, label="Name")
iface = gr.Interface(fn=greet, inputs=namelist, outputs="text")
iface.launch()

# gradio app track current running task process
process = iface