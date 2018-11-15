import React, { Component } from 'react';
import { Button, Grid, withStyles, Paper, Typography, Grow, Collapse, Fade, CircularProgress } from '@material-ui/core';
import PropTypes from 'prop-types';
import Authenticator from './auth/Authenticator';
import Profile from './Profile';
import TopBar from './TopBar';

const styles = theme => ({
    root: {
        flexGrow: 1,
    },
    button: {
        margin: theme.spacing.unit,
    },
    container: {
        display: 'flex',
    },
    paper: {
        padding: theme.spacing.unit * 2,
        textAlign: 'center',
        color: theme.palette.text.secondary,
    },
    progress: {
        margin: theme.spacing.unit * 2,
    }
});

class App extends Component {
    constructor(props) {
        super();
        this.state = {
            syllaToken: null
        };
    }

    componentWillMount() {
        
    }

    render() {
      var authElms = <div />
      if (this.state.syllaToken != null) {
        authElms = (<div>
          <Profile syllaToken={this.state.syllaToken} userID={this.state.userID} />
        </div>);
      }
      return (<div>
        <TopBar syllaToken={this.state.syllaToken}/>
        <div style={{ height: '63px' }} />
        <Authenticator onAuthenticated={(syllaToken, userID) => {
          console.log("ON AUTH: ", syllaToken, ", ", userID);
          this.setState({syllaToken: syllaToken, userID: userID});
        }} />
        {authElms}
      </div>);
    }
};

App.propTypes = {
    classes: PropTypes.object.isRequired
};

export default withStyles(styles)(App);