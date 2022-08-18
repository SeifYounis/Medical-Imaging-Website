# Assessment Details
The assessment consists of four different interfaces, each of which assess users' diagnostic decisions in different ways. The user's results are displayed once the user completes each assessment.

1. [Interfaces](#interfaces)
2. [Resuts](#results)

## Interfaces

### Binary interface with feedback (training)  
The user clicks on the image if they think there is a signal in the image, and clicks on a “No” button if they think there is no signal. After each response from the user, the display shows the target in the image (if it was there), and tells the user whether their response was correct. The interface then moves to the next image. The user has only a set amount of time to make their choice before the interface automatically moves to the next image.  Some of the images will contain a signal, some will not. The fraction of images that contain a signal (prevalence) may vary from user to user.

### Binary interface without feedback (testing)  
This interface is the same as the previous one, except that the display provides no feedback on whether the user's response was correct.

### Rating interface  
The image is displayed next to a -10 to +10 scale. The user clicks on the scale to indicate a his perceived likelihood of signal presence. The interface then moves to the next image.

### Two alternative forced-choice (2AFC) interface  
Two images are displayed to the user. One contains a signal. One does not. The user clicks on one of the two images, or presses “f” to indicate the left image and “j” to indicate the right image.

## Results
After a given user completes the assessment, the user's results are analyzed to plot the user's position on a receiver operating characteristic (ROC) curve and generate a user-specific area under the curve (AUC) table.

For more information on ROC and AUC, you can read Charles E. Metz's [Basic Principles of ROC Analysis](https://citeseerx.ist.psu.edu/viewdoc/download?doi=10.1.1.692.1962&rep=rep1&type=pdf 'ROC Analysis') as well as Nancy A. Obuchowski's [Receiver Operating
Characteristic Curves and Their Use in Radiology](http://pfeifer.phas.ubc.ca/refbase/files/Obuchowski-Radiology-2003-229-3.pdf). If you just want a brief overview, you may find [this link](https://towardsdatascience.com/understanding-auc-roc-curve-68b2303cc9c5 'ROC-AUC Article') helpful.  