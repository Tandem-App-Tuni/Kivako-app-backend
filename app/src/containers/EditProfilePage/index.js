
import React, {Component} from 'react';
import ResponsiveDrawer from '../MenuDrawer';

import Typography from '@material-ui/core/Typography';
import Avatar from '@material-ui/core/Avatar';
import Button from '@material-ui/core/Button';
import CssBaseline from '@material-ui/core/CssBaseline';
import TextField from '@material-ui/core/TextField';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import Link from '@material-ui/core/Link';
import Grid from '@material-ui/core/Grid';
import Box from '@material-ui/core/Box';
import { withStyles } from '@material-ui/core/styles';
import Container from '@material-ui/core/Container';
import PhotoCamera from '@material-ui/icons/PhotoCamera';
import IconButton from '@material-ui/core/IconButton';

const useStyles = theme => ({
  '@global': {
    body: {
      backgroundColor: theme.palette.common.white,
    },
  },
  paper: {
    marginTop: theme.spacing(8),
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  avatar: {
    margin: theme.spacing(1),
    backgroundColor: theme.palette.primary.main,
    width: 80,
    height: 80,
  },
  form: {
    width: '100%', // Fix IE 11 issue.
    marginTop: theme.spacing(3),
  },
  submit: {
    margin: theme.spacing(3, 0, 2),
  },
  avatarUpload: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
  },
  uploadBtnWrapper: {
    position: 'relative',
    overflow: 'hidden',
    display: 'inline-block',
    '& input': {
      fontSize: '100px',
      position: 'absolute',
      left: 0,
      top: 0,
      opacity: '0',
    }
  }
  ,
  
});

class EditProfilePage extends Component {
  state = {
    image: ''
}

onImageChange = (event) => {
  if (event.target.files.length > 0){
    const url = URL.createObjectURL(event.target.files[0]);
    this.setState({
        image: url
    });
  }
}

render() {
  const { classes } = this.props;
    return  (
      <div>
          <ResponsiveDrawer title = 'Profile'>
         
          <Container component="main" maxWidth="xs">
        <CssBaseline />
        <div className={classes.paper}>
          <Avatar className={classes.avatar} src={this.state.image}>
          
          </Avatar>
          <div className={classes.uploadBtnWrapper}>
          <IconButton
          color="primary"
          className={classes.button}
          aria-label="upload picture"
          component="span"
        >
          <PhotoCamera />
        </IconButton>
        <input type="file" name="myfile" onChange={this.onImageChange} />
        </div>

          <form className={classes.form} noValidate>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  autoComplete="fname"
                  name="firstName"
                  variant="outlined"
                  required
                  fullWidth
                  id="firstName"
                  label="First Name"
                  autoFocus
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  variant="outlined"
                  required
                  fullWidth
                  id="lastName"
                  label="Last Name"
                  name="lastName"
                  autoComplete="lname"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  variant="outlined"
                  required
                  fullWidth
                  id="email"
                  label="Email Address"
                  name="email"
                  autoComplete="email"
                  disabled = {true}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  variant="outlined"
                  // required
                  fullWidth
                  id="city"
                  label="City"
                  name="city"
                  autoComplete="city"
                />
              </Grid>
              <Grid item xs={12}>
              <TextField
              variant="outlined"
        id="introduction"
        label="Introduction"
        multiline
        fullWidth
        rows="4"
        defaultValue=""
        className={classes.textField}
        margin="normal"
      />
              </Grid>
             
            </Grid>
            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              className={classes.submit}
            >
              Save
            </Button>
            
          </form>
        </div>
        <Box mt={5}>
        </Box>
      </Container>
          
        </ResponsiveDrawer>
      </div>
  
      
    );
}
}
  
  export default withStyles(useStyles) (EditProfilePage);