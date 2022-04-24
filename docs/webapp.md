# Web Application

1. [Software](#software)
    * [Node.js](#nodejs)
    * [Download Instructions](#download-instructions)
2. [Hosting the app](#hosting-the-app)
    * [Heroku](#heroku)
    * [Setup Instructions](#setup-instructions)
3. [Data storage and processing](#data-storage-and-processing) 
    * [Database Editor](#database-editor)

## Software

| Frameworks | Documentation |
| ------------ | ------------- |
| [Node.js](#nodejs) | <a href="https://nodejs.org/en/docs/"><img src="https://nodejs.org/static/images/logos/nodejs-new-pantone-black.svg" width=70 alt="Node Logo"/> |
| [React.js](#client-side-reactjs) |<a href="https://reactjs.org/docs/getting-started.html"><img src="https://raw.githubusercontent.com/reactjs/reactjs.org/main/src/icons/logo.svg" width=70 alt="React Logo" />|
| [Express.js](#server-side-expressjs) |<a href="http://expressjs.com/en/5x/api.html#app"><img src="https://expressjs.com/images/express-facebook-share.png" width=100/>|

### Node.js
This application was primarily written with Node.js. Node.js is an open-source, cross-platform, JavaScript runtime environment that runs on Google Chrome's V8 engine. It can be used for both server-side processing and developing web interfaces.

Node.js package manager (npm) has a plethora of libraries for one's client-side or server-side needs. Two of the most widely used packages are React.js and Express.js.

#### Client Side: React.js 
The client-facing assessment interfaces were developed using React.js, the popular front-end web application framework developed and maintained by Facebook. Each assessment can be accessed via a specific route. Each route renders a React Component corresponding to each interface.  

#### Server Side: Express.js
The server-side functionality was developed using Express.js, a popular Node.js framework that makes it possible to do server-side processing with Javascript.

### Download Instructions
To download this application and run it locally, first install [Node.js](https://nodejs.org/en/). I also recommend installing [Git](https://git-scm.com/downloads) if you haven't already. Its bash terminal can be used to run the Node package manager using the `npm` command once Node is installed. 

In your desired directory, open your terminal and clone this repository using the following command 

`git clone https://github.com/SeifYounis/Medical-Imaging-Website.git` 

Now run the `npm install` command to download the application's required dependencies into your project folder. Now let's take a look at the various command scripts you'll want to run for this app. They're located in this application's [`package.json`](../package.json) file. Each of these keywords run one or more core Node.js commands via the `npm run <script>` command. You're more than welcome to include your scripts in this file.

```js
"scripts": {
    "start": "node server.js",
    "serve": "nodemon server.js",
    "client": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test",
    "eject": "react-scripts eject",
    "launch": "npm run build && npm run start"
  }
```
Let's go over some of the key scripts in this file:
* `npm run start` - Starts the web server
* `npm run client` - Runs the `react-scripts start` script which launches the web application interfaces without starting the interface. After running this command, any changes you make to the React code will be reflected in the interface via [hot reloading](https://medium.com/@dan_abramov/hot-reloading-in-react-1140438583bf) 
* `npm run launch` - Converts React code to browser-compatible HTML and Javascript and starts the web server
## Hosting the app

### Heroku
The working implementation of this app is hosted on [Heroku](https://www.heroku.com/about), a cloud web application platform that provides servers for database and server-side processing. Heroku was chosen for its relative simplicity in setting up servers for web apps. Its monthly pricing depends on the number of processes and database entries an app requires, with a free tier allowing one to host small-scale applications to get the hang of web hosting with Heroku. Below are some instructions for hosting this app on Heroku.

### Setup Instructions
First, sign up for a free account [here](https://id.heroku.com/login). Afterwards, you should be redirected to your dashboard, where you can click "Create New App." Once you've set up your app, click on "Configure Add-ons" in your app menu. Attach a Heroku Postgres Database to your app. 

Go into your app's settings in the "Config Vars" section, click "Reveal Config Vars." You should see an environment variable labelled DATABASE_URL with a corresponding URL value. The code for connecting to this database can be found in the file [```db.js```](../util/db.js). In particular, this snippet creates a PostgreSQL connection pool using the value of DATABASE_URL to indicate which database server to connect to.  

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

## Data Storage and Processing
This application stores and retrieves data from a PostgreSQL database. 

### Database Editor
If you want to be able to more directly view and edit the contents of this database, I recommend downloading [pgAdmin](https://www.pgadmin.org/download/). 

#### Setting up pgAdmin
Follow pgAdmin's setup instructions, which will include setting up a password to access the database servers you connect to with pgAdmin. Be sure to store this passowrd somewhere so you can reference it later as needed. 

When you open the app, click on the Dashboard and click on "Add A New Server." Give this server a name and switch to the Connection tab. Here, you will need to configure this server to connect to the Heroku PostgreSQL database. This is where the DATABASE_URL environment variable comes in handy. Database URLs take the following format 
`postgres://<username>:<password>@<host>:<port>/<database_name>.`

Use this information to fill in the relevant information in the Connection tab. Then, navigate to the SSL tab and set SSL mode to "Require." Finally, switch to the Advanced tab and fill in the database name where it says "DB restriction." This ensures that you only have access to the database this app uses, and not any of the other databases that exist at that URL.

Afterwards, you should be able to access and modify all data in the database using this editor. 