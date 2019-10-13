
import React from 'react';
import Button from '@material-ui/core/Button';
import { Link } from 'react-router-dom';
const LoginPage = () => (
    <div>
     <Button variant="contained" color = "primary" 
        component={Link} to="/edit-profile" >
          Sign in
        </Button>
    </div>
  );
  
  export default LoginPage;