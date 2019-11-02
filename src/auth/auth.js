

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

// TODO use this function to verify if the user making the request is the same that is performing some action in system and authorized
const isRequestUserAutheticatedAndValid = async (req, res, next) => {

    //MAYBE CHANGE PARAMETERS OF THE API
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
    isAuthenticated: isAuthenticated,
    isRequestUserAutheticatedAndValid:isRequestUserAutheticatedAndValid
}