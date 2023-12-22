let JwtStrategy = require("passport-jwt").Strategy;
let ExtractJwt = require("passport-jwt").ExtractJwt;
const User = require("../Models/index").user;

module.exports = (passport) => {
  let opts = {};
  opts.jwtFromRequest = ExtractJwt.fromAuthHeaderWithScheme("jwt");
  opts.secretOrKey = process.env.SECRET;

  passport.use(
    new JwtStrategy(opts, async function (jwt_payload, done) {
      // console.log(jwt_payload);
      try {
        let findUser = await User.findOne({ _id: jwt_payload._id }).exec();
        if (findUser) {
          return done(null, findUser); // req.user = findUser
        } else {
          done(null, false);
        }
      } catch (e) {
        return done(e, false);
      }
    })
  );
};
