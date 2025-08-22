const User = require('../models/User')
const { StatusCodes } = require('http-status-codes')
const { BadRequestError, UnauthenticatedError } = require('../errors')


const register = async (req, res) => {
  const{email,name,password}=req.body;
  const user=await User.create({email,name,password});
  const token= user.createJWT();
  res.status(StatusCodes.CREATED).json({user:{name},token});
}
const login = async (req, res) => {

  const{email,password}=req.body;
  if(!email || !password){
    throw new BadRequestError('Please provide email and Password');
  }
  const user= await User.findOne({email});
  if(!user || !await user.comparePassword(password)) throw new UnauthenticatedError('Please enter valid email and password');
  const token=user.createJWT();
  res.status(StatusCodes.OK).json({user:{name:user.name},token});
}

module.exports = {
    register,
    login,
  } 