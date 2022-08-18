# Web Application

1. [Software](#software)
2. [Download Instructions](#download-instructions)

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

## Download Instructions
To download this application and run it locally, first install [Node.js](https://nodejs.org/en/). I also recommend installing [Git](https://git-scm.com/downloads) if you haven't already. Its bash terminal can be used to run the Node package manager using the `npm` command once Node is installed. 

In your desired directory, open your terminal and clone this repository using the following command 

`git clone https://github.com/SeifYounis/Medical-Imaging-Website.git` 

Now run the `npm install` command to download the application's required dependencies into your project folder. Let's take a look at the various command scripts you'll want to run for this app. They're located in this application's [`package.json`](../package.json) file. Each of these keywords run one or more core Node.js commands via the `npm run <script>` command. You're more than welcome to include your own scripts in this file.

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
* `npm run client` - Runs the `react-scripts start` script which launches the web application interfaces without starting the server. After running this command, any changes you make to the front end React code will be reflected in the interface via [hot reloading](https://medium.com/@dan_abramov/hot-reloading-in-react-1140438583bf) 
* `npm run launch` - Converts React code to browser-compatible HTML and Javascript and starts the web server 