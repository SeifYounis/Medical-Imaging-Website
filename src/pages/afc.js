import React from 'react'
import test_xray from '../images/SImage326303.jpg'
import puppy from '../images/puppy.png'
import './afc.css'

class AlternateChoices extends React.Component {
    // document.addEventListener('keyup', (event) => {
    //     if (event.key == "f" || event.key == "j") {
    //         document.getElementById("afc-prompt").innerHTML = "You pressed f or j";
    //     }
    // });

    render() {
        return (
            <body>
                <div class="header">
                    <h1 class="afc-prompt part-1">
                        One of these images contains a signal. 
                        Click on the image you believe contains a signal. 
                    </h1>
        
                    <h1 class="afc-prompt part-2">
                        You can also press 'F' to select the left image or 'J' to select the right image
                    </h1>
                </div>
    
                <div class="split left" id="split-afc">
                    <div class="centered">
                        <button class="image-button" id="image-button">
                            <img src={test_xray} alt="test-xray" id="test-xray"/>
                        </button>
                    </div>
                </div>
    
                <div class="split right" id="split-afc">
                    <div class="centered">
                        <button class="image-button" id="image-button">
                            <img src={puppy} alt="test-puppy" id="test-puppy"/>
                        </button>
                    </div>
                </div>
            </body>
        )
    }
}

export default AlternateChoices;