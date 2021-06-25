import dash
from dash.resources import Scripts
import dash_html_components as html
import dash_core_components as dcc
import json

from dash.dependencies import Output, Input
from dash_extensions import Keyboard

import base64

app = dash.Dash(__name__)

# Load left image
test_xray = 'test_xray.png' 
test_xray_encoded = base64.b64encode(open(test_xray, 'rb').read())
test_xray = html.Img(
                src='data:image/png;base64,{}'.format(test_xray_encoded.decode()),
                style={
                    'height':'90vh',
                    'width': '45vw',
                    'display':'inline block'
                }
            )
            

# Load right image
puppy = 'puppy.png'
puppy_encoded = base64.b64encode(open(puppy, 'rb').read())
puppy = html.Img(
            src='data:image/png;base64,{}'.format(puppy_encoded.decode()),
            style={
                'height':'90vh',
                'width': '45vw',
                'display':'inline block'
            }
        )

app.layout = html.Div([
    Keyboard(id="keyboard"),

    html.Label(
        "One of these images contains a signal. Click on the image you believe contains a signal. You can also press 'F' to select the \
        left image or 'J' to select the right image", 
        id="2afc-prompt"
    ),

    html.Div([
        html.Button(
            test_xray
        ),

        html.Button(
            puppy
        )
        
    ]),

    html.Div(id="output")
])

@app.callback(Output("output", "children"), [Input("keyboard", "keydown")])
def keydown(event):
    with open('data.json', 'w') as json_file:
        json.dump(event, json_file)

    with open("data.json", "r") as json_file:
        try:
            data = json.load(json_file)

            if data['key'] == 'f': 
                return ("You chose the left picture")

            elif data['key'] == 'j':
                return ("You chose the right picture") 

        except (KeyError, FileNotFoundError):
            raise EnvironmentError(
                    "Your config.json file is either missing, or incomplete. Check your config.json and ensure it has the keys 'token' and 'owner_id'"
                )

if __name__ == '__main__':
    app.run_server(debug=True)