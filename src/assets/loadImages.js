/**
 * Code taken from: https://stackoverflow.com/questions/42118296/dynamically-import-images-from-a-directory-using-webpack
 */

function importAll(r) {
    let images = {};
    r.keys().map((item, index) => { 
        return images[index] = r(item); 
    });
    return images;
  }

var presentImages = importAll(require.context('../images/targetPresentImages', false, /\.(png|jpe?g|svg)$/));
var absentImages = importAll(require.context('../images/targetAbsentImages', false, /\.(png|jpe?g|svg)$/));

export {
    presentImages,
    absentImages
}