/**
 * Code taken from: https://stackoverflow.com/questions/42118296/dynamically-import-images-from-a-directory-using-webpack
 */

function importAll(r) {
    let images = [];

    r.keys().map((item, index) => {
        return images[index] = r(item);
    });

    return images;
}

export function loadImages() {
    let presentImages = importAll(require.context('../images/Present', false, /\.(png|jpe?g|svg)$/));
    let absentImages = importAll(require.context('../images/Absent', false, /\.(png|jpe?g|svg)$/));
    let presentAnswerImages = importAll(require.context('../images/Answer', false, /\.(png|jpe?g|svg)$/));
    
    return {presentImages, absentImages, presentAnswerImages}
}

export function loadTrainingImages() {
    let presentTrainingImages = importAll(require.context('../trainingImages/Present', false, /\.(png|jpe?g|svg)$/));
    let absentTrainingImages = importAll(require.context('../trainingImages/Absent', false, /\.(png|jpe?g|svg)$/));
    let presentAnswerImages = importAll(require.context('../trainingImages/Answer', false, /\.(png|jpe?g|svg)$/));

    return {presentTrainingImages, absentTrainingImages, presentAnswerImages}
}