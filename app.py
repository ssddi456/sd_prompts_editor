import json
import gradio as gr

def greet(name: str, num: int):
    return "Hello " + json.dumps(name) + "! " + str(num)

# with gr.Blocks() as testUI:
#     with gr.Accordion('test accordion'):
#         num = gr.Slider(label="Name")
#         name = gr.Textbox("name", label="input")

#     button = gr.Button("Submit 1111111")
#     button.click(greet, inputs=[name, num], outputs=gr.Textbox("name", label="output")
# )
# testUI.launch()


def createCommonFields():
    return [
        gr.Textbox(label="view"),
        gr.Textbox(label="foreground"),
        gr.Textbox(label="background"),
        gr.Textbox(label="atomosphere"),
        gr.Textbox(label="light"),
        gr.Textbox(label="magic words"),
    ]

def createCharactorCommonFields():
    return [
        gr.Textbox(label="appearance"),
        gr.Textbox(label="makeup"),
        gr.Textbox(label="clothes"),
        gr.Textbox(label="personality"),
        gr.Textbox(label="pose"),
        gr.Textbox(label="action"),
    ]

def createRealEstateCommonFields():
    return [
        gr.Textbox(label="structure"),
        gr.Textbox(label="location"),
        gr.Textbox(label="architecture"),
    ]

def createSportsCommonFields():
    return [
        gr.Textbox(label="sports"),
        gr.Textbox(label="location"),
        gr.Textbox(label="equipment"),
        gr.Textbox(label="action"),
    ] 

with gr.Blocks() as demo:
    with gr.Tabs():
        with gr.TabItem('charactor - protrait'):
            name = gr.Textbox(label="input")
            createCharactorCommonFields()
            createCommonFields()
        with gr.TabItem('charactor - wedding'):
            name = gr.Textbox(label="input")
            createCharactorCommonFields()
            createCommonFields()
        with gr.TabItem('real estate - outter'):
            name = gr.Textbox(label="input")
            createRealEstateCommonFields()
            createCommonFields()
        with gr.TabItem('real estate - inner'):
            name = gr.Textbox(label="input")
            createRealEstateCommonFields()
            createCommonFields()
        with gr.TabItem('sports - competition'):
            name = gr.Textbox(label="input")
            createSportsCommonFields()
            createCommonFields()
        with gr.TabItem('sports - extreme'):
            name = gr.Textbox(label="input",)
            createSportsCommonFields()
            createCommonFields()

demo.launch();
# gradio app track current running task process
process = demo