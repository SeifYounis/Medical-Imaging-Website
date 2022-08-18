# Heroku

1. [Overview](#overview)
2. [Setup Instructions](#setup-instructions)

## Overview
The working implementation of this app is hosted on [Heroku](https://www.heroku.com/about), a cloud web application platform that provides servers for database and server-side processing. Heroku was chosen for its relative simplicity in setting up servers for web apps. Its monthly pricing depends on the number of processes and database entries an app requires, with a free tier allowing one to host small-scale applications to get the hang of web hosting with Heroku. Below are some instructions for hosting this app on Heroku.

## Setup Instructions
First, sign up for a free account [here](https://id.heroku.com/login). Afterwards, you should be redirected to your dashboard, where you can click "Create New App." Once you've set up your app, click on "Configure Add-ons" in the Overview tab on your dashboard. Attach a Heroku Postgres Database to your app. 

### Configuration
Navigate to the Settings tab on your dashboard. Scroll down to Buildpacks and click "Add buildpack." Add Python followed by Node.js for your buildpack. **You must do so in that order**. This is because you first install the Python scripts' necessary dependencies, then Node.js's necessary dependencies. The server is activated with Node.js, which is why it must be listed as the last buildpack.

#### Environment Variables
The reader study relies on environment variables for its core functionality, including database queries and integration with [Canvas](#./docs/canvas.md). As such, you'll need to ensure your Heroku app has the necessary environment configurations. 

Go into your app's settings, and in the "Config Vars" section, click "Reveal Config Vars." You should see an environment variable labelled DATABASE_URL with a corresponding URL value. The code for connecting to this database can be found in the file [```db.js```](../util/db.js). In particular, this snippet creates a PostgreSQL connection pool using the value of DATABASE_URL to indicate which database server to connect to.  

```js
// Create and connect a new PostgreSQL database connection pool
pool = new Pool({
    connectionString: process.env.APP_DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
})
```
<b>IMPORTANT NOTE: </b>The environment variable name may need to be changed from APP_DATABASE_URL based on the environment variables you have implemented.

You'll need to add the following values to your config variables.

CONSUMER_KEY: ``<consumer key>``
CONSUMER_SECRET: ``<consumer secret>``
SESSION_SECRET = ``<session secret>``

The session secret can be anything. You likewise may choose any value as your consumer key and secret, but they must match the values you enter in your Canvas external app configuration. For more information on setting consumer key and secret, check [here](./canvas.md#setup-instructions). 

### Deployment
Once you have finished configuring your app, navigate to the Deploy tab on your dashboard and follow the instructions to host the app on a Heroku server.