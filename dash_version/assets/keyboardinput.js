window.addEventListener('keyup', function(e){
    var key = e.key
    
    if (key === "f") {
        img = loadImage('puppy.png')
        return Image(img, 20, 40, 100, 100)
    }
});
