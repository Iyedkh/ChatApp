const jwt = require('jsonwebtoken');

exports.generateToken = (userId, res) => {
  const expiresIn = process.env.JWT_EXPIRES_IN || '30d';
  
  const token = jwt.sign(
    { userId }, 
    process.env.JWT_SECRET,
    { 
      expiresIn,
      algorithm: 'HS256' // Explicitly set algorithm
    }
  );

  const cookieOptions = {
    maxAge: parseInt(expiresIn) * 24 * 60 * 60 * 1000, // Convert to milliseconds
    httpOnly: true,
    sameSite: 'strict', // or 'lax' if you need cross-site cookies
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    // domain: '.yourdomain.com' // Uncomment if using multiple subdomains
  };

  res.cookie('jwt', token, cookieOptions);
  
  return token;
};