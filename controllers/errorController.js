const errorController = {
    // triggerError(req, res, next) {
    //     try {
    //         // Intentionally throw an error
    //         throw new Error('This is an intentionally triggered error.');
    //     } catch (error) {
    //         // Pass the error to the next middleware (the error handler)
    //         next(error);
    //     }
    // },
    triggerError(req, res, next) {
        // Create a 500 status error
        const error = new Error('This is an intentionally triggered 500 server error.');
        error.status = 500;
        next(error);
    }
};

module.exports = errorController;