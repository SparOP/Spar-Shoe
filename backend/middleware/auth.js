const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
    // Get token from header (The Frontend sends this security token)
    const token = req.header('x-auth-token');

    // 1. Check if token exists
    if (!token) {
        return res.status(401).json({ message: 'No token, authorization denied' });
    }

    // 2. Verify token
    try {
        const decoded = jwt.verify(token, 'mySecretKey'); // Must use the same secret key as in server.js
        req.user = decoded.user;
        next(); // Token is valid; proceed to the next route logic
    } catch (e) {
        res.status(401).json({ message: 'Token is not valid' });
    }
};