  // Assuming other imports are correctly set up
  const userController = require('../server/controllers/userController.js');
  const { User, Notification } = require('../server/models/models.js');
  const {OAuth2Client} = require('google-auth-library');
  const bcrypt = require("bcryptjs");


  jest.mock('../server/models/models.js', () => ({
    User: {
      create: jest.fn(), // Mocking the create method of the User model
      findOne: jest.fn(),
      findOneAndUpdate: jest.fn(),
    },
    Notification: {
      create: jest.fn() //Mocking the create method on the Notification model. Note: there may be some conflicts with Notification node variable and the model itself
    }
  }));


  

  jest.mock('bcryptjs', () => ({
    compare: jest.fn(),
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

      const mockQueryResponse = { _id: 'dummyUserId', ...req.body };

      // Mock User.create to return a resolved promise with dummy user data
      User.create.mockResolvedValueOnce(mockQueryResponse);

      await userController.createUser(req, res, next);

      expect(res.locals.user).toBeDefined();
      expect(res.locals.user).toBe(mockQueryResponse)
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

describe('userController.verifyUser', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should verify user with correct username and password', async () => {
    const req = {
      body: {
        username: 'testuser',
        password: 'password',
      },
    };

    const res = {
      locals: {},
    };

    const next = jest.fn();

    const userData = {
      _id: 'dummyUserId',
      username: 'testuser',
      password: 'hashedPassword', // Assuming this is the hashed password
    };

    User.findOne.mockResolvedValueOnce(userData);

    bcrypt.compare.mockImplementationOnce((password, hashedPassword, callback) => {
      callback(null, true); // Mocking successful comparison
    });

    await userController.verifyUser(req, res, next);

    expect(res.locals.user).toBe(userData);
    expect(res.locals.userID).toBe(userData._id.toString());
    expect(res.locals.correctUser).toBe(true);
    expect(next).toHaveBeenCalled();
  });

  it('should handle incorrect password', async () => {
    const req = {
      body: {
        username: 'testuser',
        password: 'wrongPassword',
      },
    };

    const res = {
      locals: {},
      json: jest.fn(),
    };

    const next = jest.fn();

    const userData = {
      _id: 'dummyUserId',
      username: 'testuser',
      password: 'hashedPassword', // Assuming this is the hashed password
    };

    User.findOne.mockResolvedValueOnce(userData);

    bcrypt.compare.mockImplementationOnce((password, hashedPassword, callback) => {
      callback(null, false); // Mocking failed comparison
    });

    await userController.verifyUser(req, res, next);

    expect(res.json).toHaveBeenCalledWith(false);
    expect(next).not.toHaveBeenCalled();
  });

  it('should handle username not found', async () => {
    const req = {
      body: {
        username: 'nonExistingUser',
        password: 'password',
      },
    };

    const res = {
      locals: {},
      json: jest.fn(),
    };

    const next = jest.fn();

    User.findOne.mockResolvedValueOnce(null);

    await userController.verifyUser(req, res, next);

    expect(res.json).toHaveBeenCalledWith(false);
    expect(next).not.toHaveBeenCalled();
  });
});

// describe('userController.updateUserProfile', () => {
//   afterEach(() => {
//     jest.clearAllMocks();
//   });

//   it('should update user profile successfully', async () => {
//     const req = {
//       body: {
//         name: 'John',
//         lastName: 'Doe',
//         email: 'test@example.com',
//         address: '123 Main St',
//         instructions: 'Some instructions',
//       },
//     };

//     const res = {
//       locals: {
//         user: {
//           username: 'testuser',
//         },
//       },
//     };

//     const next = jest.fn();

//     const updatedUserData = {
//       _id: 'dummyUserId',
//       username: 'testuser',
//       name: 'John',
//       lastName: 'Doe',
//       email: 'test@example.com',
//       address: '123 Main St',
//       instructions: 'Some instructions',
//     };

//     User.findOneAndUpdate.mockResolvedValueOnce(updatedUserData);

//     await userController.updateUserProfile(req, res, next);

//     expect(res.locals.user).toEqual(updatedUserData);
//     expect(User.findOneAndUpdate).toHaveBeenCalledWith(
//       { username: res.locals.user.username },
//       {
//         name: req.body.name,
//         lastName: req.body.lastName,
//         email: req.body.email,
//         address: req.body.address,
//         instructions: req.body.instructions,
//       },
//       { new: true }
//     );
//     expect(next).toHaveBeenCalled();
//   });

//   it('should handle errors during profile update', async () => {
//     const req = {
//       body: {
//         name: 'John',
//         lastName: 'Doe',
//         email: 'test@example.com',
//         address: '123 Main St',
//         instructions: 'Some instructions',
//       },
//     };

//     const res = {
//       locals: {
//         user: {
//           username: 'testuser',
//         },
//       },
//     };

//     const next = jest.fn();

//     const errorMessage = 'Update failed';
//     const error = new Error(errorMessage);

//     User.findOneAndUpdate.mockRejectedValueOnce(error);

//     await userController.updateUserProfile(req, res, next);

//     expect(next).toHaveBeenCalledWith(error);
//   });
// });

// describe('userController.addToUserLibrary', () => {
//   afterEach(() => {
//     jest.clearAllMocks();
//   });

//   it('should add book to user library successfully', async () => {
//     const req = {
//       // Assuming req contains necessary data, such as res.locals.user.username and res.locals.book
//     };

//     const res = {
//       locals: {
//         user: {
//           username: 'testuser',
//           books: [],
//         },
//         book: {
//           _id: 'dummyBookId',
//           title: 'Dummy Book Title',
//         },
//       },
//     };

//     const next = jest.fn();

//     const user = {
//       username: 'testuser',
//       books: [],
//     };

//     User.findOne.mockResolvedValueOnce(user);
//     User.findOneAndUpdate.mockResolvedValueOnce(user);

//     await userController.addToUserLibrary(req, res, next);

//     expect(User.findOne).toHaveBeenCalledWith({ username: res.locals.user.username });
//     expect(User.findOneAndUpdate).toHaveBeenCalledWith(
//       { username: res.locals.user.username },
//       { $set: { books: [{ book: res.locals.book }] } },
//       { new: true }
//     );
//     expect(res.locals.user).toEqual(user);
//     expect(next).toHaveBeenCalled();
//   });

//   it('should handle errors when adding book to user library', async () => {
//     const req = {
//       // Assuming req contains necessary data, such as res.locals.user.username and res.locals.book
//     };

//     const res = {
//       locals: {
//         user: {
//           username: 'testuser',
//           books: [],
//         },
//         book: {
//           _id: 'dummyBookId',
//           title: 'Dummy Book Title',
//         },
//       },
//     };

//     const next = jest.fn();

//     // Move errorMessage declaration to a higher scope
//     const errorMessage = 'Error adding book to user library';

//     // Define error with errorMessage
//     const error = new Error(errorMessage);

//     User.findOne.mockRejectedValueOnce(error);

//     await userController.addToUserLibrary(req, res, next);

//     expect(User.findOne).toHaveBeenCalledWith({ username: res.locals.user.username });
//     expect(User.findOneAndUpdate).not.toHaveBeenCalled();
//     expect(next).toHaveBeenCalledWith(error);
//   });

// });

// describe('userController.sendSwapRequest', () => {
//   afterEach(() => {
//     jest.clearAllMocks();
//   });

//   it('should send swap request successfully', async () => {
//     const req = {
//       body: {
//         book: { title: 'Book Title' },
//         reqUsername: 'requestingUser',
//         resUsername: 'respondingUser',
//       },
//     };

//     const res = {
//       locals: {},
//     };

//     const next = jest.fn();

//     const requestingUser = {
//       username: 'requestingUser',
//       outgoingRequests: [],
//     };

//     const respondingUser = {
//       username: 'respondingUser',
//       incomingRequests: [],
//       notifications: [],
//     };

//     User.findOne.mockImplementation(username => {
//       if (username === 'requestingUser') return requestingUser;
//       if (username === 'respondingUser') return respondingUser;
//     });

//     User.findOneAndUpdate.mockImplementation((query, update) => {
//       if (query.username === 'requestingUser') {
//         requestingUser.outgoingRequests = update.outgoingRequests;
//         return requestingUser;
//       }
//       if (query.username === 'respondingUser') {
//         respondingUser.incomingRequests = update.incomingRequests;
//         respondingUser.notifications = update.notifications;
//         return respondingUser;
//       }
//     });

//     Notification.create.mockResolvedValueOnce({ message: 'Notification created' });

//     await userController.sendSwapRequest(req, res, next);

//     expect(requestingUser.outgoingRequests.length).toBe(1);
//     expect(requestingUser.outgoingRequests[0]).toEqual({
//       book: req.body.book,
//       reqUsername: req.body.reqUsername,
//       resUsername: req.body.resUsername,
//     });

//     expect(respondingUser.incomingRequests.length).toBe(1);
//     expect(respondingUser.incomingRequests[0]).toEqual({
//       book: req.body.book,
//       reqUsername: req.body.reqUsername,
//       resUsername: req.body.resUsername,
//     });

//     expect(respondingUser.notifications.length).toBe(1);
//     expect(respondingUser.notifications[0].message).toContain(req.body.book.title);

//     expect(next).toHaveBeenCalled();
//   });
// });