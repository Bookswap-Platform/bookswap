const libraryController = require('../server/controllers/libraryController.js');
//requiring in model needed to mock 
const {Book, User} = require('../server/models/models.js');

jest.mock ('../server/models/models.js', () => ({
    Book: {
        findOne: jest.fn(),
        create: jest.fn(),
        find: jest.fn(),
        findOneAndDelete: jest.fn()
     },
     User: {
        findOne: jest.fn(),
        findOneAndUpdate: jest.fn()
     }
}));

describe('libraryController.checkLibrary', () => {
    afterEach(() => {
      jest.clearAllMocks();
    });

    it ('Should store the book data in res.locals if the book is found in the database', async ()=> {

        const req = {
            body: {
                title: 'Mock Book title'
            }
        }

        const res = {
            locals: {},
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
          };

        const next = jest.fn();

        const mockResolvedQuery = {
            _id: 'dummy user id',
            title: 'Mock Book Title',
            olId: 'OL1643770W',
            previewUrl: 'https://covers.openlibrary.org/b/olid/OL739825M-M.jpg',
            author: 'Mock Author',
            genre: 'Mock Genre'
        }

        Book.findOne.mockResolvedValueOnce(mockResolvedQuery);

     await libraryController.checkLibrary (req, res, next);

      expect(res.status).not.toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
      expect(res.locals.bookData).toBe (mockResolvedQuery);
      expect(Book.findOne).toHaveBeenCalledTimes(1);
      expect(next).toHaveBeenCalled();

     });

     it ('should store the book title in res.locals if the book is not found in the database', async () => {
        const req = {
            body: {
                title: 'Mock Book title'
            }
        }

        const res = {
            locals: {},
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
          };

        const next = jest.fn();

        Book.findOne.mockResolvedValueOnce(null);

        await libraryController.checkLibrary (req, res, next);

        expect(res.status).not.toHaveBeenCalled();
        expect(res.json).not.toHaveBeenCalled();
        expect(res.locals.title).toBe (req.body.title);
        expect(Book.findOne).toHaveBeenCalledTimes(1);
        expect(next).toHaveBeenCalled();
    });

    it('should handle error if Book.findOne throws an error', async () => {
        const req = {
            body: {
                title: 'Mock Book title'
            }
        }
        const res = {
            locals: {},
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
          };

        const next = jest.fn();

        Book.findOne.mockRejectedValueOnce(new Error('Mocked error in check library controller'));

        await libraryController.checkLibrary (req, res, next);

        expect(res.status).not.toHaveBeenCalled();
        expect(res.json).not.toHaveBeenCalled();
        expect(next).toHaveBeenCalled();
        expect(next.mock.calls[0][0]).toBeInstanceOf(Error);

        
      });
});


describe('libraryController.getUserLibrary', () => {
    afterEach(() => {
      jest.clearAllMocks();
    });
  
    it('should store the user library in res.locals if the user is found in the database', async () => {
      const req = {
        params: {
          userId: 'dummyUserId',
        },
      };
  
      const userLibraryMock = {
        _id: 'dummyUserId',
        books: [
          { title: 'Book 1' },
          { title: 'Book 2' },
        ],
      };
  
      const res = {
        locals: {},
      };
  
      User.findOne.mockResolvedValueOnce(userLibraryMock);
  
      const next = jest.fn();
  
      await libraryController.getUserLibrary(req, res, next);
  
      expect(res.locals.userLibrary).toEqual(userLibraryMock.books);
      expect(User.findOne).toHaveBeenCalledTimes(1);
      expect(User.findOne).toHaveBeenCalledWith({ userId: 'dummyUserId' });
      expect(next).toHaveBeenCalled();
    });
  
    it('should handle error if User.findOne throws an error', async () => {
      const req = {
        params: {
          userId: 'dummyUserId',
        },
      };
  
      const res = {
        locals: {},
      };
  
      User.findOne.mockRejectedValueOnce(new Error('Mocked error in getUserLibrary middleware'));
  
      const next = jest.fn();
  
      await libraryController.getUserLibrary(req, res, next);
  
      expect(res.locals.userLibrary).toBeUndefined();
      expect(next).toHaveBeenCalled();
      expect(next.mock.calls[0][0]).toBeInstanceOf(Error);
    });
  });


  describe('libraryController.addToGlobalLibrary', () => {
    afterEach(() => {
      jest.clearAllMocks();
    });
  
    it('should store the existing book in res.locals if the book already exists in the database', async () => {
      const req = {
        body: {
          title: 'Mock Book Title',
          author: 'Mock Author',
          olId: 'OL1643770W',
          previewUrl: 'https://covers.openlibrary.org/b/olid/OL739825M-M.jpg',
        },
      };
  
      const res = {
        locals: {},
      };
  
      const existingBookMock = {
        _id: 'existingBookId',
        title: 'Mock Book Title',
        author: 'Mock Author',
        olId: 'OL1643770W',
        previewUrl: 'https://covers.openlibrary.org/b/olid/OL739825M-M.jpg',
      };
  
      Book.findOne.mockResolvedValueOnce(existingBookMock);
  
      const next = jest.fn();
  
      await libraryController.addToGlobalLibrary(req, res, next);
  
      expect(res.locals.book).toEqual(existingBookMock);
      expect(Book.findOne).toHaveBeenCalledTimes(1);
      expect(Book.findOne).toHaveBeenCalledWith({ olId: 'OL1643770W' });
      expect(Book.create).not.toHaveBeenCalled();
      expect(next).toHaveBeenCalled();
    });
  
    it('should create and store a new book in res.locals if the book does not exist in the database', async () => {
      const req = {
        body: {
          title: 'Mock Book Title',
          author: 'Mock Author',
          olId: 'OL1643770W',
          previewUrl: 'https://covers.openlibrary.org/b/olid/OL739825M-M.jpg',
        },
      };
  
      const res = {
        locals: {},
      };
  
      const newBookMock = {
        _id: 'newBookId',
        title: 'Mock Book Title',
        author: 'Mock Author',
        olId: 'OL1643770W',
        previewUrl: 'https://covers.openlibrary.org/b/olid/OL739825M-M.jpg',
      };
  
      Book.findOne.mockResolvedValueOnce(null);
      Book.create.mockResolvedValueOnce(newBookMock);
  
      const next = jest.fn();
  
      await libraryController.addToGlobalLibrary(req, res, next);
  
      expect(res.locals.book).toEqual(newBookMock);
      expect(Book.findOne).toHaveBeenCalledTimes(1);
      expect(Book.findOne).toHaveBeenCalledWith({ olId: 'OL1643770W' });
      expect(Book.create).toHaveBeenCalledWith({
        title: 'Mock Book Title',
        author: 'Mock Author',
        olId: 'OL1643770W',
        previewUrl: 'https://covers.openlibrary.org/b/olid/OL739825M-M.jpg',
      });
      expect(next).toHaveBeenCalled();
    });
  
    it('should handle error if Book.findOne or Book.create throws an error', async () => {
      const req = {
        body: {
          title: 'Mock Book Title',
          author: 'Mock Author',
          olId: 'OL1643770W',
          previewUrl: 'https://covers.openlibrary.org/b/olid/OL739825M-M.jpg',
        },
      };
  
      const res = {
        locals: {},
      };
  
      Book.findOne.mockRejectedValueOnce(new Error('Mocked error in addToGlobalLibrary middleware'));
  
      const next = jest.fn();
  
      await libraryController.addToGlobalLibrary(req, res, next);
  
      expect(res.locals.book).toBeUndefined();
      expect(Book.create).not.toHaveBeenCalled();
      expect(next).toHaveBeenCalled();
      expect(next.mock.calls[0][0]).toBeInstanceOf(Error);
    });
  });


  describe('libraryController.deleteBook', () => {
    afterEach(() => {
      jest.clearAllMocks();
    });
  
    it('should delete the book from the user library if the book exists in the user library', async () => {
      const req = {
        body: {
          title: 'Mock Book Title',
        },
      };
  
      const res = {
        locals: {
          user: {
            username: 'mockUsername',
            books: [
              { book: { title: 'Mock Book Title' } }
            ],
          },
          foundBooks: ['Mock Book Title','Mock Book Title','Mock Book Title'], //length greater than 1
        },
      };
  
      User.findOneAndUpdate.mockResolvedValueOnce({});
  
      const next = jest.fn();
  
      await libraryController.deleteBook(req, res, next);
  
      expect(User.findOneAndUpdate).toHaveBeenCalledTimes(1);
      expect(User.findOneAndUpdate).toHaveBeenCalledWith(
        { username: 'mockUsername' },
        { books: [] },
        { new: true }
      );
      expect(Book.findOneAndDelete).not.toHaveBeenCalled();
      expect(next).toHaveBeenCalled();
    });
  
    it('should delete the book from the global library if the book exists in the user library and res.locals.foundBooks length is less than or equal to 1', async () => {
      const req = {
        body: {
          title: 'Mock Book Title',
        },
      };
  
      const res = {
        locals: {
          user: {
            username: 'mockUsername',
            books: [
              { book: { title: 'Mock Book Title' } },
            ],
          },
          foundBooks: [], // Dependency length less than or equal to 1
        },
      };
  
      User.findOneAndUpdate.mockResolvedValueOnce({});
      Book.findOneAndDelete.mockResolvedValueOnce({});
  
      const next = jest.fn();
  
      await libraryController.deleteBook(req, res, next);
  
      expect(User.findOneAndUpdate).toHaveBeenCalledTimes(1);
      expect(User.findOneAndUpdate).toHaveBeenCalledWith(
        { username: 'mockUsername' },
        { books: [] },
        { new: true }
      );
      expect(Book.findOneAndDelete).toHaveBeenCalledTimes(1); // Book should be deleted from global library
      expect(Book.findOneAndDelete).toHaveBeenCalledWith({ "book.title": 'Mock Book Title' });
      expect(next).toHaveBeenCalled();
    });
  
    it('should handle error if User.findOneAndUpdate or Book.findOneAndDelete throws an error', async () => {
        const req = {
          body: {
            title: 'Mock Book Title',
          },
        };
    
        const res = {
          locals: {
            user: {
              username: 'mockUsername',
              books: [
                { book: { title: 'Mock Book Title' } },
              ],
            },
            foundBooks: [
              { book: { title: 'Mock Book Title' } },
            ],
          },
        };
    
        User.findOneAndUpdate.mockRejectedValueOnce(new Error('Mocked error in findOneAndUpdate'));
        Book.findOneAndDelete.mockRejectedValueOnce(new Error('Mocked error in findOneAndDelete'));
    
        const next = jest.fn();
    
        await libraryController.deleteBook(req, res, next);
    
        expect(next).toHaveBeenCalled();
        expect(next.mock.calls[0][0]).toBeInstanceOf(Error);
      });
  });

  describe('libraryController.getAllBooks', () => {
    afterEach(() => {
      jest.clearAllMocks();
    });
  
    it('should retrieve all books from the global library and store them in res.locals.globalLibrary', async () => {
      const mockBooks = [
        { title: 'Mock Book 1' },
        { title: 'Mock Book 2' },
      ];
  
      const res = {
        locals: {},
      };
  
      Book.find.mockResolvedValueOnce(mockBooks);
  
      const next = jest.fn();
  
      await libraryController.getAllBooks(null, res, next);
  
      expect(Book.find).toHaveBeenCalledTimes(1);
      expect(Book.find).toHaveBeenCalledWith({});
      expect(res.locals.globalLibrary).toEqual(mockBooks);
      expect(next).toHaveBeenCalled();
    });
  
    it('should handle error if there is an issue retrieving books from the global library', async () => {
      const res = {
        locals: {},
      };

      const error = new Error('Mocked error in Book.find')
  
      Book.find.mockRejectedValueOnce(error);
  
      const next = jest.fn();
  
      await libraryController.getAllBooks(null, res, next);
  
      expect(Book.find).toHaveBeenCalledTimes(1);
      expect(Book.find).toHaveBeenCalledWith({});
      expect(res.locals.globalLibrary).toBeUndefined();
      expect(next).toHaveBeenCalledWith({
        log: 'libraryController.getAllBooks error',
        status: 400,
        message: { err: `error getting all books from library, ${error}` },
      });
    });
  });