import React, { Component } from 'react';
import { Button, Grid, withStyles, Paper, Typography, Grow, Collapse, Fade, CircularProgress } from '@material-ui/core';
import PropTypes from 'prop-types';
import Authenticator from './auth/Authenticator';
import Profile from './Profile';

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
          <Profile syllaToken={this.state.syllaToken}/>
        </div>);
      }
      return (<div>
        <Authenticator onAuthenticated={(syllaToken) => {
          console.log("ON AUTH: ", syllaToken);
          this.setState({syllaToken: syllaToken});
        }} />
        {authElms}
      </div>);
    }
};

App.propTypes = {
    classes: PropTypes.object.isRequired
};

export default withStyles(styles)(App);