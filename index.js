import express from "express";
import bodyParser from "body-parser";

const months = [ "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December" ];

class BlogEntry {
    constructor( title, value ) {
        this.title = title;
        this.value = value;
        this.createdOn = new Date();
    }

    get entry() {
        return this.value;
    }

    set entry( value ) {
        this.value = value;
        this.lastModified = new Date();
    }

    getLastModified() {
        if ( this.lastModified )
            return this.getDateStr( this.lastModified );
    }

    getCreatedOnISO() {
        return this.createdOn.toISOString();
    }

    getCreatedOn() {
        return this.getDateStr( this.createdOn );
    }

    getTitle()
    {
        return this.title;
    }

    getDateStr( dateObj )
    {
        let monthStr = months[dateObj.getMonth()];
        let dateStr = monthStr + " " + dateObj.getDate() + ", " + dateObj.getFullYear() + " ";
        let hh24 = dateObj.getHours();
        let hours = hh24 % 12;
        if( hours === 0 )
        {
            hours = 12;
        }
        let mm = ( dateObj.getMinutes() < 10 ? "0" : "" ) + dateObj.getMinutes();
        let ss = ( dateObj.getSeconds()  < 10 ? "0" : "" ) + dateObj.getSeconds();
        let ampm = hh24 >= 12 ? "pm" : "am";
        dateStr +=  hours + ":" + mm + ":" + ss + ampm;
        return dateStr;
    }
}

var blogEntries = new Map();
var allowCreate = false;
var allowUpdate = false;

const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use( express.static( "public" ) );

app.get( "/", (req, res) => {
  res.locals.blogEntries = blogEntries;    
  res.render( "./index.ejs" );
});

app.get( "/create", (req, res) => {
    allowCreate = true;
    res.render( "./create.ejs" );
  });

app.get( "/edit", (req, res) => {
    let entry = blogEntries.get( req.query["entryCreationDate"] );
    if ( entry )
    {
        res.locals.entry = entry;
        allowUpdate = true;
    }
    res.render( "./edit.ejs" );
  });

app.post( "/create", (req, res) => {
    if( allowCreate )
    {
        let newEntry = new BlogEntry( req.body.entryTitle, req.body.story );
        blogEntries.set( newEntry.getCreatedOnISO(), newEntry );
        allowCreate = false;
    }
    res.locals.blogEntries = blogEntries;
    res.render( "./index.ejs" );
} );

app.post( "/update", (req, res) => {
    if( allowUpdate )
    {
        let entry = blogEntries.get( req.body.entryCreationDate );
        entry.entry = req.body.story;
        allowUpdate = false;
    }
    res.locals.blogEntries = blogEntries;
    res.render( "./index.ejs" );
} );

app.get( "/delete", (req, res) => {
    let entry = blogEntries.get( req.query["entryCreationDate"] );
    res.locals.entry = entry;
    res.render( "./delete.ejs" );
} );

app.post( "/delete", (req, res) => {
    blogEntries.delete( req.body.entryCreationDate );
    res.locals.blogEntries = blogEntries;
    res.render( "./index.ejs" );
} );

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });