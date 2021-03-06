const mongoose = require('mongoose')
const validate = require('mongoose-validator')
const bcrypt = require('bcrypt')

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  email: {
    type: String,
    validate: [ validate({
      validator: 'isEmail',
      message: 'Invalid Email'
    })],
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  }
})

userSchema.methods.validatePassword = function
validatePassword(password){
  return bcrypt.compareSync([password, this.password])
}

userSchema
  .virtual('passwordConfirmation')
  .set(function setPasswordConfirmation(passwordConfirmation){
    this._passwordConfirmation = passwordConfirmation
  })

userSchema
  .pre('validate', function checkPasssword(next){
    if(!this.isModified('password') && this._passwordConfirmation !== this.password) {
      this.invalidate('passwordConfirmation', 'Does not match')
    }
    next()
  })

userSchema
  .pre('save', function hashPassword(next){
    if (this.isModified('password')) {
      this.password = bcrypt.hashSync(this.password,
        bcrypt.genSaltSync(8))
    }
    next()
  })

module.exports = mongoose.model('User', userSchema)

userSchema.plugin(require('mongoose-unique-validator'))

userSchema.set('toJSON', {
  transform(doc, json){
    delete json.password
    return json
  }
})
