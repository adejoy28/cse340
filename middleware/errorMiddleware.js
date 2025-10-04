// middleware/errorMiddleware.js
const util = require('../utilities');

const errorHandler = async (err, req, res, next) => {
    console.error('Caught an intentional error:', err);
    
    let nav = await util.getNav();
    const imgPath = "/images/site/404.jpg"; // Using the same error image as 404
    
    res.status(500).render('errors/500', {
        title: 'Server Error',
        message: 'We apologize, but an unexpected error occurred on our server.',
        nav,
        imgPath
    });
};

module.exports = errorHandler;