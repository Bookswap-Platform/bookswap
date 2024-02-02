const apiController = require('../server/controllers/apiController.js');
const fetch = require('node-fetch');

jest.mock('node-fetch');

describe('apiController.newYorkTimes', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch top-selling books data from the New York Times API and store it in res.locals.bestSellers', async () => {
    const mockResponse = {
      json: jest.fn().mockResolvedValueOnce({
        results: {
          books: [
            { title: 'Mock Book 1', author: 'Mock Author 1', rank: 1 },
            { title: 'Mock Book 2', author: 'Mock Author 2', rank: 2 }
          ]
        }
      })
    };

    fetch.mockResolvedValueOnce(mockResponse);

    const req = {};
    const res = {};
    const next = jest.fn();

    await apiController.newYorkTimes(req, res, next);

    expect(fetch).toHaveBeenCalledWith('INSERT THE API HERE');
    expect(mockResponse.json).toHaveBeenCalled();
    expect(res.locals.bestSellers).toEqual([
      { title: 'Mock Book 1', author: 'Mock Author 1', rank: 1 },
      { title: 'Mock Book 2', author: 'Mock Author 2', rank: 2 }
    ]);
    expect(next).toHaveBeenCalled();
  });

  it('should handle error if there is an issue fetching top-selling books data from the New York Times API', async () => {
    const mockError = new Error('Mocked error in fetch');
    fetch.mockRejectedValueOnce(mockError);

    const req = {};
    const res = {};
    const next = jest.fn();

    await apiController.newYorkTimes(req, res, next);

    expect(fetch).toHaveBeenCalledWith('INSERT THE API HERE');
    expect(res.locals.bestSellers).toBeUndefined();
    expect(next).toHaveBeenCalledWith(mockError);
  });
});