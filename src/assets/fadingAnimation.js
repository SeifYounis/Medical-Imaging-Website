/**
 * Code for image fading functions: https://leewc.com/articles/javascript-fade-in-out-callback/
 */

function fadeIn(image) {
    var op = 0.1;  // initial opacity

    var fadeInTimer = setInterval(function () {
        if (op >= 1){
            clearInterval(fadeInTimer);
        }
        image.style.opacity = op;
        op += 0.05; // Change this value to make fade in more or less gradual
    }, 50);
}

export function fadeOutAndfadeIn(image, newImage){
	var opacity = 1;
	var fadeOutTimer = setInterval(function(){
		if(opacity < 0.1){
			clearInterval(fadeOutTimer);

            //swap the image and fade in new image
			image.src = newImage;
			fadeIn(image);
		}

		image.style.opacity = opacity;
		opacity -= 0.05; // Change this value to make fade out more or less gradual 
	}, 50);
}