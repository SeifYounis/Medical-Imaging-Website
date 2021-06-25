import dash
import dash_html_components as html
import dash_core_components as dcc

import base64

from dash_html_components.Button import Button

app = dash.Dash()

image_filename = 'test_xray.png' 
encoded_image = base64.b64encode(open(image_filename, 'rb').read())

app.layout = html.Div([
    html.Label(
        "Using the scale slider on the right, indicate the likelihood that a signal is present in the given image",
        id="rating-prompt"
    ),

    html.Div([
        html.Img(
            src='data:image/png;base64,{}'.format(encoded_image.decode()),
            style={
                'height':'35%', 
                'width':'35%', 
                'display': 'inline-block'
            }
        ),

        html.Div([
            dcc.Slider(
                id='signal-likelihood-scale',
                min=-10,
                max=10,
                step=1,
                value=0,
                marks={i: str(i) for i in range(-10, 11)},
                vertical=True,
                verticalHeight=550)],

            style={
                'display': 'inline-block'
            }
        )
    ])
])

if __name__ == '__main__':
    app.run_server(debug=True)