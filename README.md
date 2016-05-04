# SP16-team4-project

5/3/2016

I revised the app.js and views/list.ejs files to incorporate pagination into the food listing.  For reference and potential reversion, I saved copies of the previous versions of these files in the "archive may 3" folder.

4/24/2016

I revised the app.js file with some basic preliminary code and some initial routes.  I could not get the api.js file to work, or see any real use for it at this time, so I built the routes into the app.js file.  

For the root route, I just have it set to display a message: "Team 4 Final Project."

For the root api route ("/api"), I have it routing to the login view.  This view has input fields for a username and password, as well as a submit button.  However, there is nothing behind this code at this time - so the page is not functional.

For the list route ("/api/list"), I have it routing to a the list view.  This view queries the sqlite db (stored in the C://temp folder) and lists the short descriptions for all food items in the database.  The short descriptions are hyperlinks to the details page for that food item.  The list page has not been paginated yet.

For the details route ("api/details/:id"), I have it routing to a details page populating basic information based on the NDB_No that is passed in the route.  I only included some of the fields from the database, as it seemed like all of them would be too much information.

For the search route ("api/search"), I have it routing to a search page that is empty for now, except for a H1 tag.  I'm not sure how the search function will work, or if it will even need it's own view in this way, but this is an empty placeholder for now. 

