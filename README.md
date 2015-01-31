# Avery

[![NPM](https://nodei.co/npm/avery.png)](https://npmjs.org/package/avery)

Immutable models with virtuals and `Joi`-ful validation.

### API

See usage below (it's pretty simple), and then go look at
[ImmutableJS](http://facebook.github.io/immutable-js/).

Methods we add:

- `isValid` - returns true if the model passed validation. You shouldn't need
anything else.

### Usage

```javascript

var Avery = require('avery');

var User = Avery.Model({
  name : 'User',

  defaults : {
    id : null,
    email : null,
    password : null,
    firstName : null,
    lastName : null
  },

  validate : Joi.object().keys({
    id : Joi.number(),
    email : Joi.string().email(),
    password : Joi.string(),
    firstName : Joi.string(),
    lastName : Joi.string()
  }),

  virtuals : {
    fullName : function() {
      // this is bound to the ImmutableJS record
      return this.get('firstName') + ' ' + this.get('lastName');
    }
  }

});

var myUser = new User({
  id : 1,
  email : 'archer@example.com',
  password : 'supersecret',
  firstName : 'Sterling',
  lastName : 'Archer'
});

myUser.get('fullName'); // === "Sterling Archer"
myUser.get('email'); // === "archer@example.com"

myUser.set('id', 2);
myUser.get('id'); // === 1

var mutatedUser = myUser.set('id', 2);
myUser === mutatedUser; // === false
mutatedUser.get('id'); // === 2

```
