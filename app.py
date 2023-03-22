import json
import gradio as gr

def greet(name: str, num: int):
    return "Hello " + json.dumps(name) + "! " + str(num)

with gr.Blocks() as testUI:
    with gr.Accordion('test accordion'):
        num = gr.Slider(label="Name")
        name = gr.Textbox("name", label="input")

    button = gr.Button("Submit")
    button.click(greet, inputs=[name, num], outputs=gr.Textbox("name", label="output")
)
testUI.launch()

# namelist = gr.List(None, label="Name")
# iface = gr.Interface(fn=greet, inputs=namelist, outputs="text")
# iface.launch();
# # gradio app track current running task process
# process = iface