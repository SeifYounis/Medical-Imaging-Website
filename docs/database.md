# Data Storage and Processing
This application stores and retrieves data from a PostgreSQL database hosted on Heroku. For more information on attaching a database to your Heroku app, check [here](./heroku.md#setup-instructions). Code for setting up a database connection can be found [here](../util/db.js)

1. [Database Editor](#database-editor)
2. [Contents](#contents)

## Database Editor
If you want to be able to more directly view and edit the contents of this database, I recommend downloading [pgAdmin](https://www.pgadmin.org/download/). 

### Setting up pgAdmin
Follow pgAdmin's setup instructions, which will include setting up a password to access the database servers you connect to with pgAdmin. Be sure to store this passowrd somewhere so you can reference it later as needed. 

When you open the app, click on the Dashboard and click on "Add A New Server." Give this server a name and switch to the Connection tab. Here, you will need to configure this server to connect to the Heroku PostgreSQL database. This is where the DATABASE_URL environment variable comes in handy. Database URLs take the following format 

`postgres://<username>:<password>@<host>:<port>/<database_name>.`

Use this information to fill in the relevant information in the Connection tab. Then, navigate to the SSL tab and set SSL mode to "Require." Finally, switch to the Advanced tab and fill in the database name where it says "DB restriction." This ensures that you only have access to the database this app uses, and not any of the other databases that exist at that URL.

Afterwards, you should be able to access and modify all data in the database using this editor.

### Contents
The database consists of four tables:

1. ```active_connections```: This table is used to track users in a guided course waiting for an assessment to be unlocked. This table is modified [here](../socket.js) and its information is accessed via the instructor [admin](../src/components/admin.js) page.
2. ```results```: Each row of this table represents a user response from one of the reader study assessments. The table consists of 9 columns:
    *  ```session_id```: User's session ID
    * ```student_id```: The unique ID belonging to a Canvas student. For more information on how Canvas student ID's are retrieved, check [here](../server/controllers/lti_controller.js). 
    * ```username```: Username a student entered. Set and retrieved [here](../server/controllers/usersController.js).  
    * ```prompt_image```: Name of image user was asked about
    * ```answer```: User response to assessment question
    * ```solution```: Correct answer to assessment question.
    * ```assessment```: Name of assessment in which user submitted response
    * ```answer_date```: Timestamp of user response
    * ```guided```: Whether or not the user took the assessment as part of a guided instructor session

    On receiving a user response, each assessment sends a request to the route ```/add-selection``` to populate the ```results``` table. To see the route function, check [here](../main.js).
3. ```session```: Tracks user sessions. More info [here](../util/session.js).
4. ```students```: This table is populated when new users login. For more info, check [here](../src/components/loginPage.js).
