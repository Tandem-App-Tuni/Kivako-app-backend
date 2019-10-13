import React from 'react';
import {
  BrowserRouter as Router,
  Switch,
  Route
} from "react-router-dom";

import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';
import Color from './components/constant/Colors'

import './App.css';
import LoginPage from './containers/LoginPage'
import EditProfilePage from './containers/EditProfilePage'

const theme = createMuiTheme({
  palette: {
    primary: {
        main: Color.mainColor
      }
    }
  },
)

function App() {
  return (
    <MuiThemeProvider theme={theme}>
    <Router>
      <Switch>
        <Route exact path="/">
            <LoginPage />
        </Route>
        <Route exact path="/edit-profile">
            <EditProfilePage />
        </Route>
      </Switch>
    </Router>
    </MuiThemeProvider>
  );
}

export default App;
