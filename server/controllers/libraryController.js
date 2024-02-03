const {Book, User }= require('../models/models.js');

const libraryController = {};

libraryController.checkLibrary = async (req, res, next) => {
  try {
    const title = { title: req.body.title };
    const book = await Book.findOne(title);
    if (book) {
      console.log(book);
      res.locals.bookData = book;
    } else {
      res.locals.title = req.body.title;
    }
    return next();
  } catch (error) {
    console.log('Error in CheckLibrary middleware');
    return next(error);
  }
};

libraryController.getUserLibrary = async (req, res, next) => {
  try {
    const user = req.params;
    const userLibrary = await User.findOne(user);
    res.locals.userLibrary = userLibrary.books;
    return next();
  } catch (error) {
    console.log('Error in getUserLibrary middleware');
    return next(error);
  }
};

libraryController.addToGlobalLibrary = async (req, res, next) => {
  try {
    console.log(">> here is req.body in libraryController.addToGlobalLibrary: ", req.body);
    const { title, author, olId, previewUrl } = req.body;
    const checkBook = await Book.findOne({ olId });
    if (checkBook) {
      console.log('book already exists');
      res.locals.book = checkBook;
    } else {
      const book = await Book.create({ title, author, olId, previewUrl });
      res.locals.book = book;
    }
    return next();
  } catch (error) {
    console.log('Error in addToGlobalLibrary middleware', error);
    return next(error);
  }
};


libraryController.deleteBook = async (req, res, next) => {
  const { title } = req.body;
  try {
    const newUserLibrary = res.locals.user.books.filter(item => item.book.title !== title);
    const updatedUser = await User.findOneAndUpdate(
      { username: res.locals.user.username },
      { books: newUserLibrary },
      { new: true }
    );
    res.locals.user = updatedUser;
    // if that was the last copy in global library, delete from global library
    if (res.locals.foundBooks.length <= 1) {
      const deletedBook = await Book.findOneAndDelete({ "book.title": title })
    }
    return next()    
  } catch (error) {
    console.log('error in libraryController.deleteBook: ', error)
    return next(error)
  }
};

libraryController.updateBook = (req, res, next) => { };

// get all books in global library
libraryController.getAllBooks = (req, res, next) => {
  return Book.find({})
    .then((data) => {
      res.locals.globalLibrary = data;
      console.log(data)
      return next();
    })
    .catch((err) => {
      return next({
        log: 'libraryController.getAllBooks error',
        status: 400,
        message: { err: `error getting all books from library, ${err}`},
      });
    });
};

libraryController.retrieveBook = async (req, res, next) => {
  const title = req.body.title;
  try {
    // find all books

    const results = await User.aggregate([
      { $unwind: "$books" },
      { $match: {'books.book.title': { $regex: new RegExp(title, 'i') }} },
      { $project: { _id: 0, username: 1, address: 1, books: 1 } },
    ]);
    // save books and users in object in {user: user, book: book} format in res.locals.books
    res.locals.foundBooks = results;
    console.log(results);
    return next();
  } catch (error) {
    console.log('Error in libraryController.retrieveBook: ', error);
  }
};


module.exports = libraryController;
