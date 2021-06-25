import dash
import dash_html_components as html

import base64

from dash_html_components.Div import Div

app = dash.Dash(__name__)

test_xray = "test_xray.png"
test_xray_encoded = base64.b64encode(open(test_xray, 'rb').read())

app.layout = html.Div([
    html.Label(
        "Click on the image if you believe it contains a signal. Otherwise, click 'No'.",
        id="testing-prompt"
    ),

    html.Div([
        html.Img(
            src='data:image/png;base64,{}'.format(test_xray_encoded.decode()),
            style={
                'height':'35%', 
                'width':'35%', 
                'display':'inline block' # Puts elements side by side
            }
        ),

        html.Div([
            html.Button(
                children="No",
            )],

            style={
                'display': 'block',
                'margin-left': 'auto',
                'margin-right': 'auto'
            }
        )
    ])
])

if __name__ == '__main__':
    app.run_server(debug=True)