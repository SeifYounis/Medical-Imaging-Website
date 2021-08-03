# Medical Imaging Evaluation Traininng
 
We would like to have two possible ways to run the course

1) As part of a self-guided web-based course,
2) As an interactive lecture where I present material and can control which portions of the quiz/study are available to the audience.

It would be good to reuse as much code as possible for these two course scenarios.

In either scenario there would be four sessions with four interfaces presented to the user/student.

## Binary interface without feedback (testing)  
User clicks on image if he thinks there is a signal in the image, and clicks on a “No” button if he thinks there is no signal.   The interface moves to the next image.  The user has only a set amount of time make this choice before the interface automatically moves to the next image.  Some of the images will contain a signal, some will not.  The fraction of images that contain a signal (prevalence) may vary from user to user.

## Binary interface with feedback (training)  
This interface is the same as the previous one, except after each response from the user, the display shows the target in the image (if it was there), and tells the user whether her assessment was correct.

## Rating interface  
The image is displayed next to a -10 to +10 scale.  The user clicks on the scale to indicate a his perceived likelihood of signal presence.  The interface then moves to the next image.

## Two alternative forced-choice (2AFC) interface  
Two images are displayed to the user.  One contains a signal.  One does not.  She clicks on one of the two images, or presses “f” to indicate the left image and “j” to indicate the right image.
## 

**In all scenarios, the image should blank momentarily after the user’s response so he knows that the input was received and the image is changing.**
