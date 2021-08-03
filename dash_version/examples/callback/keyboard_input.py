import dash
import dash_html_components as html
import json
from dash.dependencies import Output, Input, State
from dash_extensions import Keyboard

app = dash.Dash()
app.layout = html.Div([Keyboard(id="keyboard"), html.Div(id="output")])

@app.callback(
    Output("output", "children"), 
    [Input("keyboard", "n_keydowns")],
    [State("keyboard", "keydown")],
)
def keydown(n_keydowns, event):
    return json.dumps(event)


if __name__ == '__main__':
    app.run_server()