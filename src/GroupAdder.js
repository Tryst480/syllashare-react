import React, { Component } from 'react';
import { Button, TextField, Switch, IconButton, Snackbar, FormLabel, Chip, Avatar, Table, TableRow, TableCell, withStyles, FormControlLabel, TableHead, TableBody, Paper, Typography, Grow, Collapse, Fade, CircularProgress } from '@material-ui/core';
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

class GroupAdder extends Component {
    constructor(props) {
        super();
        this.state = {
            groupName: "",
            readPublic: false,
            writePublic: false,
            writableInvites: true,
            users: [],
            errorMsg: null
        };
    }

    componentWillMount() {
        var params = {};
        var body = {};
        
    }

    addGroup() {
        API.graphql(graphqlOperation(mutations.createGroup, {groupName: this.state.groupName, readPrivate: !this.state.readPublic, writePrivate: !this.state.writePublic})).then((minGroup) => {
            var invitePromises = [];
            for (var user of this.state.users) {
                invitePromises.push(API.graphql(graphqlOperation(mutations.inviteToGroup, { groupName: this.state.groupName, inviteToUserID: user.id, write: this.state.writableInvites })));
            }
            Promise.all(invitePromises).then((results) => {
                this.props.onGroupAdded({ "name": this.state.groupName, "private": !this.state.readPublic });
            })
            .catch((ex) => {
                console.error("GROUP INVITE ERROR: ", ex);
            })
        }).catch((err) => {
            console.error("Create Group ERR: ", err);
            this.setState({
                "errorMsg": "Group Name Already In Use"
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
        var excludedUsers = { [this.props.myUsername]: true };
        for (var existingUser of this.state.users) {
            excludedUsers[existingUser.username] = true;
        }
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
            <Button className={classes.topRightCorner} onClick={this.addGroup.bind(this)}>
              Create Group
            </Button>
            <TextField InputLabelProps={{ shrink: true }}
                label="Group Name"
                className={classes.textField}
                value={this.state.groupName}
                onChange={(evt) => {this.setState({ groupName: evt.target.value })}}
                InputProps={{
                    classes: {
                        input: classes.bigFont,
                    },
                }}
                margin="normal"
            />
            <FormLabel component="legend">Read</FormLabel>
            <FormControlLabel control={<Switch
                    label="Read"
                    checked={this.state.readPublic}
                    onChange={(evt) => {this.setState({ readPublic: evt.target.checked, writePublic: (!evt.target.checked)? false: this.state.writePublic })}}
                    value={this.state.readPublic}
                />} label={(this.state.readPublic)? "Public": "Private"} />
            <FormLabel component="legend">Write</FormLabel>
            <FormControlLabel control={<Switch
                    label="Write"
                    checked={this.state.writePublic}
                    onChange={(evt) => {this.setState({ writePublic: evt.target.checked, readPublic: (evt.target.checked)? true: this.state.readPublic })}}
                    value={this.state.writePublic}
                />} label={(this.state.writePublic)? "Public": "Private"} />
            <hr />
            <UserChips users={this.state.users} 
                onUserDeleted={(user, i) => {
                    console.log("USERI:", i);
                    var newUsers = this.state.users;
                    newUsers.splice(i, 1);
                    this.setState({ "users": newUsers });
                }}
                size={30} />
            <UserSearcher 
                excludedUsers={excludedUsers}
                onUserSelected={(user) => {
                    var newUsers = this.state.users.splice(0);
                    console.log("ADDING USER: ", user);
                    newUsers.push(user);
                    this.setState({
                        "users": newUsers
                    });
                }}/>
            {
                (this.state.users.length > 0 && !this.state.readPublic)? (<div>
                    <FormLabel component="legend">User Privileges</FormLabel>
                    <FormControlLabel control={<Switch
                        label="Allow Write"
                        checked={this.state.writableInvites}
                        onChange={(evt) => {this.setState({ writableInvites: evt.target.checked })}}
                        value={this.state.writableInvites}
                    />} label={(this.state.writableInvites)? "Full Access": "Read Only"} /></div>): <div />
            }
        </div>);
    }
};

GroupAdder.propTypes = {
    classes: PropTypes.object.isRequired
};

export default withStyles(styles)(GroupAdder);