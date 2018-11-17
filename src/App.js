import React, { Component } from 'react';
import { Button, Grid, withStyles, Paper, Typography, Grow, Collapse, Fade, CircularProgress } from '@material-ui/core';
import PropTypes from 'prop-types';
import Authenticator from './auth/Authenticator';
import Profile from './Profile';
import TopBar from './TopBar';
import Group from './Group';

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
          <Profile syllaToken={this.state.syllaToken} userID={this.state.userID} onGroupSelected={(groupName) => {
                window.history.pushState('page2', 'Title', '/' + groupName);
                var listener = window.addEventListener('popstate', (event) => {
                    this.setState({
                        "groupName": null
                    });
                    window.removeEventListener('popstate', listener);
                });
                this.setState({
                    "groupName": groupName
                });
          }} />
        </div>);
      }
      if (this.state.groupName == null) {
        return (<div>
            <TopBar syllaToken={this.state.syllaToken} userID={this.state.userID} />
            <div style={{ height: '63px' }} />
            <Authenticator onAuthenticated={(syllaToken, userID) => {
            console.log("ON AUTH: ", syllaToken, ", ", userID);
            this.setState({syllaToken: syllaToken, userID: userID});
            }} />
            {authElms}
        </div>);
      } else {
          return (<div>
                <TopBar syllaToken={this.state.syllaToken} userID={this.state.userID} onTitleClicked={() => {this.setState({ "groupName": null })}} />
                <div style={{ height: '63px' }} />
                <Group groupName={this.state.groupName} userID={this.state.userID} onLeave={() => {this.setState({ "groupName": null })}} />
          </div>)
      }
    }
};

App.propTypes = {
    classes: PropTypes.object.isRequired
};

export default withStyles(styles)(App);