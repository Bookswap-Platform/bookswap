const db = require('../models/models');


const apiController = {};

apiController.checkApi = async (req, res, next) => {
    try {
        if (res.locals.title){
            const bookTitle = res.locals.title.replaceAll(' ', '+');
            const response = await fetch(`https://openlibrary.org/search.json?title=${bookTitle}&limit=5`);  
            const data = await response.json();

            const bookData = data.docs.slice(0, 5).map((doc) => ({
              olId: doc.key.slice(7),
              title: doc.title,
              author: doc.author_name ? doc.author_name[0] : "Unknown Author",
              previewUrl: doc.cover_edition_key
                ? `https://covers.openlibrary.org/b/olid/${doc.cover_edition_key}-M.jpg`
                : "",
                genre: doc.subject ? doc.subject:[]
            }));

            console.log(">>> searched books: ", bookData);
            res.locals.bookData = bookData;
            console.log(res.locals.bookData);
            return next();
        }
        else {
            return next();
        }
    } catch (error) {
        console.log ('Error in apiController fetch request', error)
    }
}

module.exports = apiController;
