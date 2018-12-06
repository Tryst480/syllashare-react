import React, { Component } from 'react';
import { Table, TableRow, TableCell, Button, withStyles, TableHead, TableBody, Paper, Typography, Grow, Collapse, Fade, CircularProgress } from '@material-ui/core';
import PropTypes from 'prop-types';
import Amplify, { API, graphqlOperation } from "aws-amplify";
import { AwsExports } from './cloud/CloudExports';
import * as queries from './graphql/queries';
import * as mutations from './graphql/mutations';
import * as subscriptions from './graphql/subscriptions';

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

class ClassList extends Component {
    constructor(props) {
        super();
        this.state = {
            classes: [],
            invites: []
        };
    }

    componentWillMount() {
        this.getClasses();
        this.subscribeToInvites();
    }

    getClasses() {
        API.graphql(graphqlOperation(queries.getUserClasses, { "userID": this.props.userID })).then((data) => {
            var recvClasses = data.data.getUserClasses;
            var classes = [];
            var invites = [];
            for (var c of recvClasses) {
                var accepted = c.group.accepted;
                if (accepted) {
                    classes.push(c);
                } else {
                    invites.push(c);
                }
            }
            this.setState({ "classes": classes, "invites": invites });
        }).catch((err) => {
            console.error("GetClasses error:", err);
        });
    }

    
    acceptInvite(invite) {
        console.log("ACCEPT: ", invite.id);
        API.graphql(graphqlOperation(mutations.joinGroup, {groupName: invite.id })).then((groupUserPair) => {
            console.log("Joined Group", JSON.stringify(groupUserPair));
            var i = 0;
            for (var it of this.state.invites) {
                if (it.id == invite.id) {
                    var newInvites = this.state.invites;
                    newInvites.splice(i, 1);
                    var newClasses = this.state.classes;
                    newClasses.push(it);
                    this.setState({
                        invites: newInvites,
                        groups: newClasses
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
        console.log("LEAVE: ", invite.id);
        API.graphql(graphqlOperation(mutations.leaveGroup, {groupName: invite.id })).then((groupUserPair) => {
            console.log("LEFT GROUP: ", JSON.stringify(groupUserPair));
            var i = 0;
            for (var it of this.state.invites) {
                if (it.id == invite.id) {
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
                if (group.courseID != null) {
                    this.getClasses();
                }
            },
            error: (error) => {
                console.log("SUBInviteERR", JSON.stringify(error));
            }
        });
        console.log("SET INVITE SUBSCRIPTION: ", this.inviteSubscription);
    }

    render() {
        const { classes } = this.props;

        var renderInviteList = (this.state.invites.length > 0)? (<Table className={classes.table}>
            <TableHead>
                <TableRow>
                    <TableCell><b>Invitations</b></TableCell>
                    <TableCell></TableCell>
                    <TableCell></TableCell>
                </TableRow>
            </TableHead>
            <TableBody>
            {this.state.invites.map(c => {
                return (
                    <TableRow key={c.id} onClick={() => {console.log("CS:", c.id); this.props.onClassSelected(c.id)}}>
                        <TableCell component="th" scope="row">
                            {c.course.name}
                        </TableCell>
                        <TableCell><Button onClick={(e) => {this.acceptInvite(c); e.stopPropagation();}}>Accept</Button></TableCell>
                        <TableCell><Button onClick={(e) => {this.declineInvite(c); e.stopPropagation();}}>Decline</Button></TableCell>
                    </TableRow>
                    );
            })}
            </TableBody>
        </Table>): <div />;
        return (<div>
            <Paper className={classes.root}>
                {(this.state.classes.length > 0)? (
                    <Table className={classes.table}>
                        <TableHead>
                            <TableRow>
                                <TableCell>Name</TableCell>
                                <TableCell>Teacher</TableCell>
                                <TableCell>Times</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                        {this.state.classes.map(c => {
                            return (
                            <TableRow key={c.id} onClick={() => {console.log("CS:", c.id); this.props.onClassSelected(c.id)}}>
                                <TableCell component="th" scope="row">
                                    {c.course.name}
                                </TableCell>
                                <TableCell>{c.teacher.name}</TableCell>
                                <TableCell>{c.timeStr}</TableCell>
                            </TableRow>
                            );
                        })}
                        </TableBody>
                    </Table>
                    ): <div />
                    }
                    {renderInviteList}
                    <Button color="primary" 
                        aria-label="Add" className={classes.button}
                        onClick={this.props.onClassCreate}>
                        Create Class
                    </Button>
                </Paper>
        </div>);
    }
};

ClassList.propTypes = {
    classes: PropTypes.object.isRequired
};

export default withStyles(styles)(ClassList);