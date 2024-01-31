// Assuming other imports are correctly set up
const userController = require('../server/controllers/userController.js');
const { User } = require('../server/models/models.js');
const {OAuth2Client} = require('google-auth-library');


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
    //valid request body, has all the details 
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

    // response object that has res.locals, res.status, and res.json
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
        username: 'testuser'
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
    User.create.mockRejectedValueOnce(new Error('Mocked create error'));
  
    await userController.createUser(req, res, next);
  
    // Assert that the global error handler is invoked
    expect(next).toHaveBeenCalled();
    expect(next.mock.calls[0][0]).toBeInstanceOf(Error);
    expect(next.mock.calls[0][0].message).toBe('Mocked create error');
  });
  
  });

  jest.mock('google-auth-library', () => ({
    OAuth2Client: jest.fn().mockImplementation(() => ({
      verifyIdToken: jest.fn(),
    })),
  }));
  
  describe('userController.verifyOAuth', () => {
    afterEach(() => {
      jest.clearAllMocks();
    });
  
    it('should call next with the user data in res.locals once the verification is successful', async () => {
      const req = { body: { credential: 'some_token' } };
      const res = { locals: {} };
      const next = jest.fn();

    // Create a new instance of OAuth2Client using the mocked constructor
    const {OAuth2Client} = require('google-auth-library');

    const client = new OAuth2Client;
  
      const mockPayload = {
        sub: 'user_id',
        given_name: 'John',
        family_name: 'Doe',
        email: 'john.doe@example.com',
      };
  
      const mockTicket = {
        getPayload: jest.fn().mockResolvedValue(mockPayload),
      };
  
  
      
 
     



    // Call the method under test
    await userController.verifyOAuth(req, res, next);

    // Mock the behavior of verifyIdToken method of OAuth2Client
   client.verifyIdToken.mockResolvedValue(mockTicket);
     
  
      // Assert that the user data is set in res.locals and next is called once
      expect(res.locals.user).toEqual({
        name: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        userID: 'user_id',
      });
      expect(next).toHaveBeenCalledTimes(1);
    });
  });