import React, { Component } from 'react';
import { Button, Grid, withStyles, Paper, Typography, Grow, Collapse, Fade, CircularProgress } from '@material-ui/core';
import PropTypes from 'prop-types';
import Authenticator from './auth/Authenticator';
import Profile from './Profile';
import TopBar from './TopBar';
import Group from './Group';
import Chat from './Chat';

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
            syllaToken: null,
            userID: null,
            groupName: null,
            chats: []
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
        var body = null;
        if (this.state.groupName == null) {
            body = (<div>
                <TopBar syllaToken={this.state.syllaToken} userID={this.state.userID} />
                <div style={{ height: '63px' }} />
                <Authenticator onAuthenticated={(syllaToken, userID) => {
                console.log("ON AUTH: ", syllaToken, ", ", userID);
                this.setState({syllaToken: syllaToken, userID: userID});
                }} />
                {authElms}
            </div>);
        } else {
            body = (<div>
                <TopBar syllaToken={this.state.syllaToken} userID={this.state.userID} onTitleClicked={() => {this.setState({ "groupName": null })}} />
                <div style={{ height: '63px' }} />
                <Group groupName={this.state.groupName} userID={this.state.userID}
                    onChatOpen={(chatInfo) => {
                        var newChats = this.state.chats;
                        newChats.push(chatInfo);
                        this.setState({
                            chats: newChats
                        });
                    }} 
                    onLeave={() => {this.setState({ "groupName": null })}} />
            </div>)
        }
        return (<div>
            {body}
            {
                (this.state.chats.length > 0)? (
                <div style={{position: "fixed",
                    bottom: 0,
                    right: 0,
                    width: 300,
                    height: 500,
                    background: "#FFFFFF",
                    "box-shadow": "rgba(0,0,0,0.2) 0px 2px 3px, inset rgba(0,0,0,0.2) 0px -1px 2px",
                    "border-radius": 20
                    }}>
                    {
                        <Chat userID={this.state.userID} chatID={this.state.chats[0].id} chatName={this.state.chats[0].name} 
                            onClose={() => { 
                                var newChats = this.state.chats;
                                newChats.splice(0, 1);
                                this.setState({ "chats": newChats });
                            }}/>
                    }
                </div>): <div />
            }
        </div>);
    }
};

App.propTypes = {
    classes: PropTypes.object.isRequired
};

export default withStyles(styles)(App);