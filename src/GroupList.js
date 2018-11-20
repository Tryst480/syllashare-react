import React, { Component } from 'react';
import { Modal, Button, Table, TableRow, TableCell, withStyles, TableHead, TableBody, Paper, Typography, Grow, Collapse, Fade, CircularProgress } from '@material-ui/core';
import PropTypes from 'prop-types';
import Amplify, { API, graphqlOperation } from "aws-amplify";
import { AwsExports } from './cloud/CloudExports';
import * as queries from './graphql/queries';
import * as mutations from './graphql/mutations';
import * as subscriptions from './graphql/subscriptions';
import GroupAdder from './GroupAdder';

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
    modalPaper: {
        position: 'absolute',
        width: theme.spacing.unit * 50,
        backgroundColor: theme.palette.background.paper,
        boxShadow: theme.shadows[5],
        padding: theme.spacing.unit * 4,
    },
    progress: {
        margin: theme.spacing.unit * 2,
    }
});

function getModalStyle() {
    const top = 50;
    const left = 50;
  
    return {
      top: `${top}%`,
      left: `${left}%`,
      transform: `translate(-${top}%, -${left}%)`,
    };
  }

class GroupList extends Component {
    constructor(props) {
        super();
        this.state = {
            groups: [],
            invites: []
        };
    }

    componentWillMount() {
        console.log("MOUNTING");
        if (this.props.mutable) {
            this.subscribeToInvites();
        }
        API.graphql(graphqlOperation(queries.getGroups)).then((myGroups) => {
            console.log("GOT GROUPS: ", myGroups.data.getGroups);
            var groups = [];
            var invites = [];
            for (var groupEntry of myGroups.data.getGroups) {
                var group = groupEntry.group;
                var numMembers = 0;
                for (var user of group.users) {
                    if (user.accepted) {
                        numMembers++;
                    }
                }
                if (groupEntry.accepted) {
                    groups.push({ "name": group.name, "visibility": ((group.readPrivate)? "Private": "Public"), "members": numMembers })
                } else if (this.props.mutable) {
                    invites.push({ "name": group.name, "visibility": ((group.readPrivate)? "Private": "Public"), "members": numMembers })
                }
            }
            this.setState({ "groups": groups, "invites": invites });
        }).catch((err) => {
            console.error("GetGroups error:", err);
        });
    }

    componentWillUnmount() {
        console.log("UNMOUNTING")
        if (this.inviteSubscription != null) {
            console.log("UNSUBSCRIBING!");
            this.inviteSubscription.unsubscribe();
            this.inviteSubscription = null;
        }
    }

    onGroupAdded(group) {
        var groups = this.state.groups;
        groups.push({ "name": group.name, "visibility": ((group.private)? "Private": "Public"), "members": 1 });
        this.setState({
            "groups": groups,
            "addingGroup": false
        });
    }

    acceptInvite(invite) {
        API.graphql(graphqlOperation(mutations.joinGroup, {groupName: invite.name })).then((groupUserPair) => {
            console.log("Joined Group", JSON.stringify(groupUserPair));
            var i = 0;
            for (var it of this.state.invites) {
                if (it.name == invite.name) {
                    var newInvites = this.state.invites;
                    newInvites.splice(i, 1);
                    var newGroups = this.state.groups;
                    newGroups.push(invite);
                    this.setState({
                        invites: newInvites,
                        groups: newGroups
                    });
                    return;
                }
                i++;
            }
        }).catch((err) => {
            console.error("Join Group ERR: ", err);
        })
    }

    declineInvite(invite) {
        API.graphql(graphqlOperation(mutations.leaveGroup, {groupName: invite.name })).then((groupUserPair) => {
            console.log("LEFT GROUP: ", JSON.stringify(groupUserPair));
            var i = 0;
            for (var it of this.state.invites) {
                if (it.name == invite.name) {
                    var newInvites = this.state.invites;
                    newInvites.splice(i, 1);
                    this.setState({
                        invites: newInvites
                    });
                    return;
                }
                i++;
            }
        }).catch((err) => {
            console.error("Leave Group ERR: ", err);
        })
    }

    subscribeToInvites = () => {
        if (this.inviteSubscription != null) {
            console.log("UNSUBSCRIBING!");
            this.inviteSubscription.unsubscribe();
            this.inviteSubscription = null;
        }
        console.log("SUBSCRIBING TO INVITES FOR ID: ", this.props.userID)
        this.inviteSubscription = API.graphql(graphqlOperation(subscriptions.subUserInviteToGroup, { "userID": this.props.userID })).subscribe({
            next: (groupUserPair) => {
                console.log("GOT NEW INVITE: ", groupUserPair);
                var group = groupUserPair.value.data.subUserInviteToGroup["group"];
                //Check if group is already added
                for (var invite of this.state.invites) {
                    if (invite.name == group.name) {
                        return;
                    }
                }
                var newInvites = this.state.invites;
                var numMembers = 0;
                for (var user of group.users) {
                    if (user.accepted) {
                        numMembers++;
                    }
                }
                newInvites.push({ "name": group.name, "visibility": ((group.readPrivate)? "Private": "Public"), "members": numMembers });
                this.setState({
                    invites: newInvites
                });
            },
            error: (error) => {
                console.log("SUBInviteERR", JSON.stringify(error));
            }
        });
        console.log("SET INVITE SUBSCRIPTION: ", this.inviteSubscription);
    }

    render() {
        const { classes } = this.props;

        var renderInviteList = this.state.invites.length > 0? (
            <Table className={classes.table}>
                <TableHead>
                    <TableRow>
                        <TableCell><b>Group Invitations</b></TableCell>
                        <TableCell></TableCell>
                        <TableCell></TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                {this.state.invites.map((invite) => {
                    return (<TableRow onClick={() => {this.props.onGroupSelected(invite.name)}}>
                        <TableCell>{invite.name}</TableCell>
                        <TableCell><Button onClick={(e) => {this.acceptInvite(invite); e.stopPropagation();}}>Accept</Button></TableCell>
                        <TableCell><Button onClick={(e) => {this.declineInvite(invite); e.stopPropagation();}}>Decline</Button></TableCell>
                    </TableRow>)
                })}
                </TableBody>
            </Table>
        ): <div />;

        return (<div>
            <Modal
                aria-labelledby="simple-modal-title"
                aria-describedby="simple-modal-description"
                open={this.state.addingGroup}
                onClose={() => { this.setState({ addingGroup: false }) }}>
                <div style={getModalStyle()} className={classes.modalPaper}>
                    <GroupAdder myUsername={this.props.myUsername} onGroupAdded={this.onGroupAdded.bind(this)}/>
                </div>
            </Modal>
            <Paper className={classes.root}>
                <Table className={classes.table}>
                    <TableHead>
                        <TableRow>
                            <TableCell>Name</TableCell>
                            <TableCell>Visibility</TableCell>
                            <TableCell>Members</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                    {this.state.groups.map(row => {
                        return (
                        <TableRow key={row.id}  onClick={() => {this.props.onGroupSelected(row.name)}}>
                            <TableCell component="th" scope="row">
                            {row.name}
                            </TableCell>
                            <TableCell>{row.visibility}</TableCell>
                            <TableCell>{row.members}</TableCell>
                        </TableRow>
                        );
                    })}
                    </TableBody>
                </Table>
                
                {renderInviteList}
                { (this.props.mutable)?
                    <Button color="primary" 
                    aria-label="Add" className={classes.button}
                    onClick={() => {this.setState({ "addingGroup": true })}}>
                    Create Group
                    </Button>: <div />
                }
            </Paper>
        </div>);
    }
};

GroupList.propTypes = {
    classes: PropTypes.object.isRequired
};

export default withStyles(styles)(GroupList);