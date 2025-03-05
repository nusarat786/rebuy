import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { IUser, UserType } from '../Model/UserModel';
import  UserService  from '../Services/UserServices';  // Import your user service
import { currentUnixTimestampMs } from './getIsoDate';

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
      callbackURL: process.env.URL + '/auth/google/callback',  // Adjust for your environment
    },
    async (token: string, tokenSecret: string, profile: any, done: Function) => {
      // You can map the profile info and create or find the user in your database.
      try {
        //console.log(profile);
        const userEmail = profile.emails[0].value;

        const userService:UserService = new UserService();
        let user: IUser | null = await userService.findUserByEmailV2(userEmail);
        //console.log("user",user);

        if (!user) {
          const newUser: Partial<IUser> = {
            email: userEmail,
            firstName: profile.name.givenName || profile.displayName,
            lastName: profile.name.familyName || profile.displayName,
            password: profile.id+'OLXcolone#123',
            phone: null,
            phoneCode: null,
            userType: UserType.User,
            profilePicture: profile.photos?.[0]?.value || null,
          };
          user = await userService.createUser(newUser as IUser);

          //console.log("new");
          //console.log(user);
          if(!user) {
            throw new Error('User not created');
          }
          
          return done(null, { ...user, profile });
        }
        

        return done(null, { ...user, profile });  // Add token to user object
      } catch (error) {
        return done(error, false);
      }
    }
  )
);

passport.serializeUser((user: any, done: Function) => {
  done(null, user);
});

passport.deserializeUser((user: any, done: Function) => {
  done(null, user);
});
