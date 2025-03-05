import { Router } from 'express';
import { asyncHandler, UserController } from '../../Controller/UserController';
import authMiddleware from '../../Middleware/authMiddleware';
import passport from 'passport';
const router = Router();


const userConroller:UserController=new UserController()


/**
 * @swagger
 * /userRoutes/register:
 *   post:
 *     tags:
 *       - User
 *     summary: Register a new user
 *     description: Endpoint to register a new user with profile picture upload and validation.
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *                 example: Nusarat
 *               lastName:
 *                 type: string
 *                 example: haveliwala
 *               email:
 *                 type: string
 *                 format: email
 *                 example: nusarathaveliwala@gmail.com
 *               password:
 *                 type: string
 *                 example: Aa#12345
 *               phone:
 *                 type: string
 *                 example: "1234567890"
 *               phoneCode:
 *                 type: string
 *                 example: "+1"
 *               profilePicture:
 *                 type: string
 *                 format: binary
 *                 description: "Profile picture file upload (image)"
 *     responses:
 *       201:
 *         description: User registred successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: User registred successfully
 *                 data:
 *                   $ref: '#/components/schemas/IUser'
 *       400:
 *         description: Validation or bad request error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               $ref: '#/components/schemas/ErrorObj'
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               $ref: '#/components/schemas/ErrorObj'
 */
router.post('/userRoutes/register', authMiddleware,userConroller.register.bind(userConroller));

/**
 * @swagger
 * /userRoutes/update:
 *   post:
 *     tags:
 *       - User
 *     summary: Register a new user
 *     description: Endpoint to register a new user with profile picture upload and validation.
 *     requestBody:
 *       required: false
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *                 example: Nusarat
 *               lastName:
 *                 type: string
 *                 example: haveliwala
 *               email:
 *                 type: string
 *                 format: email
 *                 example: nusarathaveliwala@gmail.com
 *               phone:
 *                 type: string
 *                 example: "1234567890"
 *               phoneCode:
 *                 type: string
 *                 example: "+1"
 *               profilePicture:
 *                 type: string
 *                 format: binary
 *                 description: "Profile picture file upload (image)"
 *     responses:
 *       201:
 *         description: profile updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: User updated successfully
 *                 data:
 *                   $ref: '#/components/schemas/IUser'
 *       400:
 *         description: Validation or bad request error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               $ref: '#/components/schemas/ErrorObj'
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               $ref: '#/components/schemas/ErrorObj'
 */
router.post('/userRoutes/update',authMiddleware, userConroller.update.bind(userConroller));




/**
   * @swagger
   * /userRoutes/login:
   *   post:
   *     summary: User login
   *     tags: [User]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               email:
   *                 type: string
   *                 example: nusarat.haveliwala@example.com
   *               password:
   *                 type: string
   *                 example: "SecureP@ssw0rd"
   *     responses:
   *       200:
   *         description: User logged in successfully
   *       400:
   *         description: Validation or bad request error.
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               $ref: '#/components/schemas/ErrorObj'
   *       500:
   *         description: Internal server error.
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               $ref: '#/components/schemas/ErrorObj'
   */
router.post('/userRoutes/login', userConroller.login.bind(userConroller));

/**
   * @swagger
   * /userRoutes/loginWithIP:
   *   post:
   *     summary: User login with IP
   *     tags: [User]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               email:
   *                 type: string
   *                 example: nusarat.haveliwala@example.com
   *               password:
   *                 type: string
   *                 example: "SecureP@ssw0rd"
   *     responses:
   *       200:
   *         description: User logged in successfully with IP
   *       400:
   *         description: Validation or bad request error.
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               $ref: '#/components/schemas/ErrorObj'
   *       500:
   *         description: Internal server error.
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               $ref: '#/components/schemas/ErrorObj'
   */
router.post('/userRoutes/loginWithIP', userConroller.loginWithIp.bind(userConroller));


/**
 * @swagger
 * /userRoutes/test:
 *   post:
 *     tags:
 *       - Users
 *     summary: Login a user
 *     description: Endpoint to login a user with validation and autherization.
 *     requestBody:
 *       required: false
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: nusarathaveliwala@gmail.com
 *               password:
 *                 type: string
 *                 example: Aa#12345
 *     responses:
 *       201:
 *         description: User registred successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: User logged in successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     token:
 *                       type: string
 *                       example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjYxMz"
 *                     user:
 *                       $ref: '#/components/schemas/IUser'
 *       400:
 *         description: Validation or bad request error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               $ref: '#/components/schemas/ErrorObj'
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               $ref: '#/components/schemas/ErrorObj'
 */
router.post('/userRoutes/test',authMiddleware ,(req, res) => { 
    
    const user = (req as any).user;
    const Credate = new Date(user.iat * 1000);
    const Expdate = new Date(user.exp * 1000);

    res.status(200).json({user,Credate,Expdate});
});  


/**
   * @swagger
   * /userRoutes/forgetPassword:
   *   post:
   *     summary: Forgot password
   *     tags: [User]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               email:
   *                 type: string
   *                 example: nusarat.haveliwala@example.com
   *     responses:
   *       200:
   *         description: OTP sent successfully
   *       400:
   *         description: Validation or bad request error.
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               $ref: '#/components/schemas/ErrorObj'
   *       500:
   *         description: Internal server error.
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               $ref: '#/components/schemas/ErrorObj'
   */
router.post('/userRoutes/forgetPassword', userConroller.forgotPassword.bind(userConroller));

/**
   * @swagger
   * /userRoutes/resetPassword:
   *   post:
   *     summary: Reset password
   *     tags: [User]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               email:
   *                 type: string
   *                 example: nusarat.haveliwala@example.com
   *               otp:
   *                 type: string
   *                 example: "123456"
   *               password:
   *                 type: string
   *                 example: "NewP@ssw0rd"
   *     responses:
   *       200:
   *         description: Password reset successfully
   *       400:
   *         description: Validation or bad request error.
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               $ref: '#/components/schemas/ErrorObj'
   *       500:
   *         description: Internal server error.
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               $ref: '#/components/schemas/ErrorObj'
   */
router.post('/userRoutes/resetPassword', userConroller.resetPassword.bind(userConroller));


// Route for starting the Google authentication flow
router.get('/userRoutes/auth/google',
   passport.authenticate('google', {
     scope: ['profile', 'email'],
   })
 );
 
 // Callback route for Google authentication
 router.get('/auth/google/callback',
   passport.authenticate('google', { failureRedirect: '/' }),
   userConroller.loginWithGoogle.bind(userConroller)  // Once authenticated, handle the login with Google
 );


router.post('/userRoutes/verifyToken',authMiddleware,userConroller.verifyToken.bind(userConroller));
// router.get(
//    '/auth/google/callback',
//    passport.authenticate('google', { failureRedirect: '/' }),
//    asyncHandler(userConroller.loginWithGoogle.bind(userConroller)) // Wrap the function to avoid type mismatch
//  );
 

// router.put('/test', (req, res) => {   });

// router.delete('/test', (req, res) => {   });



export default router;