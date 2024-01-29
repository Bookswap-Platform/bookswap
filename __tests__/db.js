// Assuming other imports are correctly set up
const userController = require('../server/controllers/userController.js');
const { User } = require('../server/models/models.js');

jest.mock('../server/models/models.js', () => ({
  User: {
    create: jest.fn(), // Mocking the create method of the User model
  },
}));

describe('userController.createUser', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create a new user when all required fields are provided', async () => {
    const req = {
      body: {
        username: 'testuser',
        password: 'password',
        name: 'John',
        lastName: 'Doe',
        email: 'test@example.com',
        address: '123 Main St',
      },
    };

    const res = {
      locals: {},
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    const next = jest.fn();

    // Mock User.create to return a resolved promise with dummy user data
    User.create.mockResolvedValueOnce({ _id: 'dummyUserId', ...req.body });

    await userController.createUser(req, res, next);

    expect(res.locals.user).toBeDefined();
    expect(res.locals.userID).toBeDefined();
    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
    expect(User.create).toHaveBeenCalledTimes(1);
  });

  it('should return a 400 error if any required field is missing', async () => {
    const req = {
      body: {
        // Missing some required fields
        username: 'testuser',
        password: 'password',
      },
    };

    const res = {
      locals: {},
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    const next = jest.fn();

    await userController.createUser(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'All fields are required' });
    expect(res.locals.user).toBeUndefined();
    expect(res.locals.userID).toBeUndefined();
    expect(User.create).not.toHaveBeenCalled();
  });
  it('should handle error if User.create throws an error', async () => {
    const req = {
      body: {
        username: 'testuser',
        password: 'password',
        name: 'John',
        lastName: 'Doe',
        email: 'test@example.com',
        address: '123 Main St',
      },
    };
  
    const res = {
      locals: {},
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  
    const next = jest.fn();
  
    // Mock User.create to throw an error
    const error = new Error('Mocked create error');
    User.create.mockRejectedValueOnce(error);
  
    await userController.createUser(req, res, next);
  
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'Create User Error', err: error });
    expect(res.locals.user).toBeUndefined();
    expect(res.locals.userID).toBeUndefined();
  });
  
});
