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

class GroupAdder extends Component {
    constructor(props) {
        super();
        this.state = {
            groupName: "",
            public: false,
            users: [],
            errorMsg: null
        };
    }

    componentWillMount() {
        var params = {};
        var body = {};
        
    }

    addGroup() {
        console.log("GRAPH OP: ", graphqlOperation(mutations.createGroup, {groupName: this.state.groupName, groupPrivate: !this.state.public}));
        API.graphql(graphqlOperation(mutations.createGroup, {groupName: this.state.groupName, groupPrivate: !this.state.public})).then((minGroup) => {
            var invitePromises = [];
            for (var user of this.state.users) {
                invitePromises.push(API.graphql(graphqlOperation(mutations.inviteToGroup, { groupName: this.state.groupName, inviteToUserID: user.id })));
            }
            Promise.all(invitePromises).then((results) => {
                this.props.onGroupAdded({ "name": this.state.groupName, "private": !this.state.public });
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
            <FormControlLabel control={<Switch
                    label="Public"
                    checked={this.state.public}
                    onChange={(evt) => {this.setState({ public: evt.target.checked})}}
                    value={this.state.public}
                />} label={(this.state.public)? "Public": "Private"} />
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
        </div>);
    }
};

GroupAdder.propTypes = {
    classes: PropTypes.object.isRequired
};

export default withStyles(styles)(GroupAdder);