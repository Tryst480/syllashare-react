import React, { Component } from 'react';
import { Button, TextField, Switch, IconButton, Snackbar, Chip, Avatar, Table, TableRow, TableCell, withStyles, FormControlLabel, TableHead, TableBody, Paper, Typography, Grow, Collapse, Fade, CircularProgress } from '@material-ui/core';
import PropTypes from 'prop-types';
import UserSearcher from './UserSearcher';
import CloseIcon from '@material-ui/icons/Close';
import UserChips from './UserChips';
import classNames from 'classnames';
import Amplify, { Storage, Auth, Hub, API, graphqlOperation } from 'aws-amplify';
import { AwsExports } from './cloud/CloudExports';
import * as queries from './graphql/queries';
import * as mutations from './graphql/mutations';

Amplify.configure(AwsExports);

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
    },
    textField: {
        marginLeft: theme.spacing.unit,
        marginRight: theme.spacing.unit,
        width: 300
    },
    bigFont: {
        fontSize: 'x-large'
    },
    topRightCorner: {
        position: "absolute",
        top: 0,
        right: 0,
        margin: "5px"
    },
});

class ChatCreator extends Component {
    constructor(props) {
        super();
        this.state = {
            chatName: "",
            chatSubject: "",
            creating: false
        };
    }

    createChat() {
        this.setState({
            creating: true
        })
        API.graphql(graphqlOperation(mutations.createChat, {groupName: this.props.groupName, chatName: this.state.chatName, chatSubject: this.state.chatSubject})).then((minGroup) => {
            this.props.onChatCreated();
        }).catch((err) => {
            console.error("Create Chat ERR: ", err);
            this.setState({
                "errorMsg": "Chat Name Already In Use",
                "creating": false
            });
        });
    }
    
    onSnackClose() {
        this.setState({
            errorMsg: null
        });
    }

    render() {
        const { classes } = this.props;
        return (<div>
            <Snackbar 
                anchorOrigin={{vertical: 'bottom', horizontal: 'left'}} 
                open={(this.state.errorMsg != null)} 
                autoHideDuration={6000}
                ContentProps={{
                    'aria-describedby': 'message-id',
                }}
                onClose={this.onSnackClose.bind(this)}
                message={<span id='message-id'>{this.state.errorMsg}</span>}
                action={[
                    <IconButton
                        key="close"
                        aria-label="Close"
                        color="inherit"
                        className={classes.close}
                        onClick={this.onSnackClose.bind(this)}
                    >
                        <CloseIcon />
                    </IconButton>,
                ]}
                    />
            <Typography variant="h3" gutterBottom>
                Create Chat for {this.props.groupName}
            </Typography>
            <TextField InputLabelProps={{ shrink: true }}
                label="Chat Name"
                className={classes.textField}
                value={this.state.chatName}
                onChange={(evt) => {this.setState({ chatName: evt.target.value })}}
                InputProps={{
                    classes: {
                        input: classes.bigFont,
                    },
                }}
                margin="normal"
            />
            <TextField InputLabelProps={{ shrink: true }}
                label="Chat Subject"
                className={classes.textField}
                value={this.state.chatSubject}
                onChange={(evt) => {this.setState({ chatSubject: evt.target.value })}}
                InputProps={{
                    classes: {
                        input: classes.bigFont,
                    },
                }}
                margin="normal"
            />
            <Button disabled={(this.state.chatName.length == 0 && !this.state.creating)}variant="contained" size="large" color="primary" className={classes.button} onClick={this.createChat.bind(this)}>
                Create Chat
            </Button>
        </div>);
    }
};

ChatCreator.propTypes = {
    classes: PropTypes.object.isRequired
};

export default withStyles(styles)(ChatCreator);