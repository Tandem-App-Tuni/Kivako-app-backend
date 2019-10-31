

const isAuthenticated = async (req, res, next) => {
    let userlog = true;

    if(userlog == true){
        return next();
    }else{
        res.status(400).json({
            'message': 'access denied'
        });
    }
    
}

module.exports = {
    isAuthenticated: isAuthenticated
}