# Canvas Instructure

1. [Overview](#overview)
2. [Setup Instructions](#setup-instructions)

## Overview
Canvas Instructure is an online learning management system. It is widely used by instructors to administer and manage classes at various education levels. Since this reader study application is implemented as part of an instructional course, I've decided to integrate this application as an external tool that this course can use, allowing the app to check student credentials and control the flow of user navigation through these various assessments.

There are two versions of the course this application is used with. One is a guided version and the other is a self-study version. The guided version contains an admin page only the instructor can open. This page contains controls to configure the number of assessments, as well has how long the user has to give answer before the assessment switches to the next prompt. It also controls .

## Setup Instructions
To use Canvas, first create a free instructor account if you don't have one already. You are given the option to sign in via numerous other accounts, including Google, Facebook, Github, and Microsoft. 

......

After you've created the course, go to Settings. Navigate to the Apps tab and click "View App Configurations." From there, click to add an external app. Give it a name, and add the launch url of the app, formatted as follows:

`https://<app-host-domain>/lti/launch`

Now add the following to the "Consumer Key" and "Shared Secret" fields. 

Consumer Key: `reader study`
Consumer Secret: `xzc342AScx`

Note: the field values are taken from the CONSUMER_KEY and CONSUMER_SECRET environment variables. These may change if you use different values for the environment variables.