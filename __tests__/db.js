  // Assuming other imports are correctly set up
  const userController = require('../server/controllers/userController.js');
  const { User } = require('../server/models/models.js');
  const {OAuth2Client} = require('google-auth-library');


  jest.mock('../server/models/models.js', () => ({
    User: {
      create: jest.fn(), // Mocking the create method of the User model
      findOne: jest.fn(),
    },
  }));

  jest.mock('google-auth-library', () => ({
    OAuth2Client: jest.fn().mockImplementation(() => ({
      verifyIdToken: jest.fn(), // Ensure verifyIdToken is mocked as a function
    })),
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



  // describe('userController.verifyOAuth', () => {
  //   afterEach(() => {
  //     jest.clearAllMocks();
  //   });

  //   it('should set user data in locals and call next on successful verification', async () => {
  //     const req = {
  //       body: {
  //         credential: 'mocked_token',
  //       },
  //     };

  //     const res = {
  //       locals: {},
  //     };

  //     const next = jest.fn();

  //     // Mock successful verification response
  //     const mockPayload = {
  //       sub: 'mocked_user_id',
  //       given_name: 'John',
  //       family_name: 'Doe',
  //       email: 'john.doe@example.com',
  //     };
  //     const mockTicket = { getPayload: () => mockPayload };
  //     OAuth2Client.prototype.verifyIdToken.mockResolvedValue(mockTicket);

  //     await verifyOAuth(req, res, next);

  //     // Assertions
  //     expect(res.locals.user).toEqual({
  //       name: 'John',
  //       lastName: 'Doe',
  //       email: 'john.doe@example.com',
  //       userID: 'mocked_user_id',
  //     });
  //     expect(next).toHaveBeenCalled();
  //   });

  //   it('should call next with error on verification failure', async () => {
  //     const req = {
  //       body: {
  //         credential: 'mocked_token',
  //       },
  //     };

  //     const res = {
  //       locals: {},
  //     };

  //     const next = jest.fn();

  //     // Mock verification failure
  //     const error = new Error('Verification failed');
  //     OAuth2Client.prototype.verifyIdToken.mockRejectedValue(error);

  //     await verifyOAuth(req, res, next);

  //     // Assertions
  //     expect(next).toHaveBeenCalledWith({
  //       log: 'userController.verifyOAuth Error',
  //       status: 400,
  //       message: { err: 'verify Oauth Error, Error: Verification failed' },
  //     });
  //   });
  // });

  describe('userController.checkUser', () => {
    afterEach(() => {
      jest.clearAllMocks();
    });

    it ('should check that the username does not already exist in the database during signup', async () => {
      const req = {
        params: {
          username: 'mocked_username',
        },
      };

      const res = {
        locals: {},
      };

      const next = jest.fn();

      User.findOne.mockResolvedValueOnce({ _id: 'dummyUserId' });

      await userController.checkUser (req, res, next);

      expect(res.locals.userAvailability).toBeDefined();
      expect(res.locals.userAvailability).toBeFalsy();
      expect(User.findOne).toHaveBeenCalledTimes(1);
      expect(next).toHaveBeenCalled();
    });

    it ('should return a truthy value if the username does not exist in the database', async () => {
      const req = {
        params: {
          username: 'mocked_username',
        },
      };

      const res = {
        locals: {},
      };

      const next = jest.fn();

      User.findOne.mockResolvedValueOnce(null);

      await userController.checkUser (req, res, next);

      expect(res.locals.userAvailability).toBeDefined();
      expect(res.locals.userAvailability).toBeTruthy();
      expect(User.findOne).toHaveBeenCalledTimes(1);
      expect(next).toHaveBeenCalled();
    });

});