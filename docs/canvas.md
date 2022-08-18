# Canvas Instructure

1. [Overview](#overview)
2. [Setup Instructions](#setup-instructions)
    * [Course Configuration](#course-configuration)
    * [Course Details](#course-details)
 
## Overview
Canvas Instructure is an online learning management system. It is widely used by instructors to administer and manage classes at various education levels. Since this reader study application is implemented as part of an instructional course, I've decided to integrate the web assessment as an external tool that this course can use, allowing the app to check student credentials and control the flow of user navigation through these various assessments.

There are two versions of the course this application is used with. One is a guided version and the other is a self-study version. The guided version contains an admin page only the instructor can open. This page contains controls to configure the number of assessments, as well has how long the user has to give answer before the assessment switches to the next prompt. It also allows the instructor to control which assessments users are allowed to access at any given time.

## Setup Instructions
To use Canvas, first create a free instructor account if you don't have one already. You are given the option to sign in via numerous other accounts, including Google, Facebook, Github, and Microsoft. 

Create two reader study courses: a guided version and a self study version. My web app implementation differentiates which course is which by checking the title of the course when an assignment is launched. If you decide to use my implementation without changing anything, the self study course must have "Self Study" in its title.

If you would like to simply import the courses I created so that you have your own version, you can grab the Canvas export course files I have provided in the ```canvas``` folder. Be sure to create and name your courses as specified above. For each course, you can then go into your settings, click "Import Course Content", select "Canvas Course Export Package," and upload each export file corresponding to your course type. Note that in my course I create duplicate versions of assigments when testing the web app in development mode vs using the production app. 

Importing course info in this way will save you the trouble of creating a courseflow as I specify in the Course Details section, but you must still follow the instructions laid out in the Course Configuration section.

### Course Configuration
**YOU MUST FOLLOW THESE CONFIGURATION STEPS EVEN IF YOU IMPORT THE COURSE**.

Within your course(s), go to Settings. At the bottom of the Course Details tab, click on where it says "more options". From there, I'd recommend checking the box labelled "Let students self-enroll by sharing with them a secret URL or code." This is how you can add students to the course.

From there, navigate to the Apps tab and click "View App Configurations." From there, click to add an external app. Give it a name, and add the launch url of the app, formatted as follows:

`https://<app-host-domain>/lti/launch`

Now add the following to the "Consumer Key" and "Shared Secret" fields. 

Consumer Key: `<consumer key>`
Consumer Secret: `<consumer secret>`

Note: the field values are taken from the CONSUMER_KEY and CONSUMER_SECRET environment variables. For more information on setting environment variables in your web app, check [here](./heroku.md#environment-variables).

### Course Details
The course details are the same for both versions of the course unless otherwise specified.

#### Assignments
Now it's time to add assignments to your course. Navigate to your Assignments section. You must create one of each of the following types of assignments. Be sure your assignment names includes these keywords in the title. Assign the specified number of points to each assignment. 

1. Admin - 0 points (**guided only**)
2. Login - 1 point
2. Training - 10 points
3. Testing Part 1 - 10 points
4. Testing Part 2 - 10 points
5. Rating - 1 point
6. Two Alternate Forced Choice - 10 points

**Note**: At least a few of these point counts aren't hard truths, and they can all be changed if you decide to modify how I implement submitting scores and grading. I'm just specifying what worked for me.

For each assignment, set Submission Type to "External Tool." In the field where you are to provide the external tool URL, click "Find" and select the external app you added, and check the box labelled "Load This Tool in a New Tab". Finally, for every assignment **except Admin**, click "Save and Publish." Just click "Save" for Admin.

#### Modules
Modules are how you control the flow of the course. Go to the Modules section of your course. I recommend creating an introductory module for the Login assignment and then creating modules for each assessment. Attach the assignments you've created to their corresponding assessment module. You can also attach additional material related to each assessment in their respective modules by creating *pages* for them. Navigate to the Pages section to do so.

To ensure completion of each module's content, I recommend clicking *Edit* for each module and checking the radio button labelled *Students must complete all of these requirements* as well as checking the box labelled *Students must move through requirements in sequential order*. Then, click *Add requirement* and add your desired pages and assessment in whatever order you see fit. 

For your pages requirements, I recommend selecting the option *view the item*. For your assessment requirements, please select the *score at least* option. Set a score value of 1.0 for the Login and Rating assignments, and a score value of 0.0 for the other assignments. Once again, I'm basing these values off of what worked for me.

Once you have finished setting up your modules, you should be ready to implement the reader study course. 