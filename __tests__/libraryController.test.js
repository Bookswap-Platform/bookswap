const libraryController = require('../server/controllers/libraryController.js');
//requiring in model needed to mock 
const {Book} = require('../server/models/models.js');
const { findOneAndUpdate } = require('../server/models/sessionModel');

jest.mock ('../server/models/models.js', () => ({
    Book: {
        findOne: jest.fn(),
        create: jest.fn(),
        find: jest.fn()
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

    it('should handle error if User.create throws an error', async () => {
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

