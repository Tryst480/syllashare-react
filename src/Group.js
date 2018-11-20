import React, { Component } from 'react';
import { Modal, Button, Grid, Card, CardContent, FormLabel, FormControlLabel, Switch, IconButton, Table, TableRow, TableCell, withStyles, TableHead, TableBody, Paper, Typography, Grow, Collapse, Fade, CircularProgress, CardActionArea } from '@material-ui/core';
import PropTypes from 'prop-types';
import Amplify, { API, graphqlOperation } from "aws-amplify";
import { AwsExports } from './cloud/CloudExports';
import * as queries from './graphql/queries';
import * as mutations from './graphql/mutations';
import * as subscriptions from './graphql/subscriptions';
import GroupAdder from './GroupAdder';
import UserChips from './UserChips';
import ExitToAppIcon from '@material-ui/icons/ExitToApp';
import MailIcon from '@material-ui/icons/Mail';
import AddIcon from '@material-ui/icons/Add';
import { Parallax, Icon } from 'react-parallax';
import UserSearcher from './UserSearcher'
import ChatCreator from './ChatCreator';

Amplify.configure(AwsExports);

function getModalStyle() {
    const top = 50;
    const left = 50;
  
    return {
      top: `${top}%`,
      left: `${left}%`,
      transform: `translate(-${top}%, -${left}%)`,
    };
  }

const styles = theme => ({
    root: {
        display: "flex",
        "justify-content": "center",
        "align-items": "center"
    },
    button: {
        margin: theme.spacing.unit,
        "margin-top": 40
      },
      extendedIcon: {
        marginRight: theme.spacing.unit,
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

class Group extends Component {
    constructor() {
        super();
        this.state = {
            loading: true,
            invited: false,
            accepted: false,
            writable: false,
            readPrivate: true,
            writePrivate: true,
            users: [],
            invites: [],
            chats: [],
            sendInviteUsers: [],
            createChatModal: false,
            inviteModal: false,
            writableInvites: true
        };
    }

    componentWillMount() {
        this.loadGroup(this.props);
    }

    loadGroup(props) {
        API.graphql(graphqlOperation(queries.getGroup, { "groupName": props.groupName })).then((resp) => {
            console.log("GOT GROUP: ", this.props.groupName);
            this.subscribeToInvites(props);
            this.subscribeToGroupJoin(props);
            this.subscribeToGroupLeave(props);
            this.subscribeToChatCreation(props);
            var group = resp.data.getGroup["group"];
            var accepted = resp.data.getGroup["accepted"];
            var writable = resp.data.getGroup["writable"];
            var readPrivate = group["readPrivate"];
            var writePrivate = group["writePrivate"];
            var newUsers = [];
            var newInvites = [];
            for (var user of group.users) {
                if (user.writable) {
                    user.color = "#89CFF0";
                }
                if (user.accepted) {
                    newUsers.push(user);
                } else {
                    newInvites.push(user);
                }
            }
            var newChats = [];
            for (var chat of group.chats) {
                newChats.push(chat);
            }
            this.setState({ "users": newUsers, "invites": newInvites, "chats": newChats, "accepted": accepted, "writable": writable, "readPrivate": readPrivate, "writePrivate": writePrivate, "loading": false, "invited": true });
        }).catch((err) => {
            console.error("GetGroup error:", err);
            this.subscribeToMyInvites(props);
            this.setState({ "loading": false, "invited": false });
        });
    }

    unsubAll() {
        if (this.inviteSubscription != null) {
            this.inviteSubscription.unsubscribe();
            this.inviteSubscription = null;
        }
        if (this.myInviteSubscription != null) {
            this.myInviteSubscription.unsubscribe();
            this.myInviteSubscription = null;
        }
        if (this.groupJoinSubscription != null) {
            this.groupJoinSubscription.unsubscribe();
            this.groupJoinSubscription = null;
        }
        if (this.groupLeaveSubscription != null) {
            this.groupLeaveSubscription.unsubscribe();
            this.groupLeaveSubscription = null;
        }
        if (this.chatCreateSubscription != null) {
            this.chatCreateSubscription.unsubscribe();
            this.chatCreateSubscription = null;
        }
    }

    componentWillUnmount() {
        this.unsubAll();
    }

    acceptInvite() {
        this.setState({
            "loading": true
        });
        API.graphql(graphqlOperation(mutations.joinGroup, { groupName: this.props.groupName })).then((data) => {
            var group = data.data.joinGroup["group"];
            var thisUser = null;
            for (var user of group["users"]) {
                if (user.id == this.props.userID) {
                    thisUser = user;
                    break;
                }
            }
            console.log("WRITABLE: ", thisUser);
            this.setState({
                "accepted": true,
                "writable": thisUser["writable"],
                "loading": false
            });
        }).catch((err) => {
            console.error("Join Group ERR: ", err);
        })
    }

    declineInvite() {
        this.setState({
            "loading": true
        });
        API.graphql(graphqlOperation(mutations.leaveGroup, {groupName: this.props.groupName })).then((groupUserPair) => {
            console.log("LEFT GROUP: ", JSON.stringify(groupUserPair));
            this.props.onLeave();
            this.setState({
                "accepted": false,
                "invited": false,
                "loading": false
            });
        }).catch((err) => {
            console.error("Leave Group ERR: ", err);
        })
    }

    setWritable(userID, writable) {
        API.graphql(graphqlOperation(mutations.setWritable, { groupName: this.props.groupName, setUserID: userID, writable: writable })).then((userWritablePair) => {
            for (var user of this.state.users) {
                if (user.id == userID) {
                    if (writable) {
                        user.color = "#89CFF0";
                    } else {
                        user.color = null;
                    }
                    user.writable = writable;
                }
            }
            for (var user of this.state.invites) {
                if (user.id == userID) {
                    if (writable) {
                        user.color = "#89CFF0";
                    } else {
                        user.color = null;
                    }
                    user.writable = writable;
                }
            }
        }).catch((err) => {
            console.error("Set Writable ERR: ", err);
        })
    }

    kickUser(userID) {
        API.graphql(graphqlOperation(mutations.leaveGroup, {groupName: this.props.groupName, kickUserID: userID })).then((groupUserPair) => {
            console.log("User Kicked: ", JSON.stringify(groupUserPair));
            this.setState({
                "editUser": null
            });
        }).catch((err) => {
            console.error("Kick Group ERR: ", err);
        })
    }

    subscribeToMyInvites = (props) => {
        if (this.myInviteSubscription != null) {
            this.myInviteSubscription.unsubscribe();
            this.myInviteSubscription = null;
        }

        this.myInviteSubscription = API.graphql(graphqlOperation(subscriptions.subUserInviteToGroup, { "userID": props.userID })).subscribe({
            next: (groupUserPair) => {
                var group = groupUserPair.value.data.subUserInviteToGroup["group"];
                if (group.name == props.groupName) {
                    this.loadGroup();
                    this.myInviteSubscription.unsubscribe();
                    this.myInviteSubscription = null;
                    return;
                }
            },
            error: (error) => {
                console.log("SUBInviteERR", JSON.stringify(error));
            }
        });
    }

    subscribeToInvites = (props) => {
        if (this.inviteSubscription != null) {
            this.inviteSubscription.unsubscribe();
            this.inviteSubscription = null;
        }

        this.inviteSubscription = API.graphql(graphqlOperation(subscriptions.subInviteToGroup, { "groupName": props.groupName })).subscribe({
            next: (groupUserPair) => {
                var user = groupUserPair.value.data.subInviteToGroup["user"];
                //Check if group is already added
                for (var invite of this.state.invites) {
                    if (invite.id == user.id) {
                        return;
                    }
                }
                if (user["writable"]) {
                    user["color"] = "#89CFF0"
                } else {
                    user["color"] = null;
                }
                var newInvites = this.state.invites;
                newInvites.push(user);
                this.setState({
                    invites: newInvites
                });
            },
            error: (error) => {
                console.log("SUBInviteERR", JSON.stringify(error));
            }
        });
    }

    subscribeToGroupJoin = (props) => {
        if (this.groupJoinSubscription != null) {
            this.groupJoinSubscription.unsubscribe();
            this.groupJoinSubscription = null;
        }

        this.groupJoinSubscription = API.graphql(graphqlOperation(subscriptions.subJoinGroup, { "groupName": props.groupName })).subscribe({
            next: (groupUserPair) => {
                var user = groupUserPair.value.data.subJoinGroup["user"];
                //Stop if user is already a member
                for (var groupMember of this.state.users) {
                    if (groupMember.id == user.id) {
                        return;
                    }
                }

                //Check if group is already added
                var newInvites = this.state.invites;
                var i = 0;
                for (var invite of this.state.invites) {
                    if (invite.id == user.id) {
                        newInvites.splice(i, 1);
                        break;
                    }
                    i++;
                }
                
                var newUsers = this.state.users;
                console.log("USER JOIN", user);
                if (user["writable"]) {
                    user["color"] = "#89CFF0"
                } else {
                    user["color"] = null;
                }
                newUsers.push(user);
                this.setState({
                    "invites": newInvites,
                    "users": newUsers
                });
            },
            error: (error) => {
                console.log("SUBGroupJoinERR", JSON.stringify(error));
            }
        });
    }

    subscribeToGroupLeave = (props) => {
        if (this.groupLeaveSubscription != null) {
            this.groupLeaveSubscription.unsubscribe();
            this.groupLeaveSubscription = null;
        }

        this.groupLeaveSubscription = API.graphql(graphqlOperation(subscriptions.subLeaveGroup, { "groupName": props.groupName })).subscribe({
            next: (groupUserPair) => {
                var user = groupUserPair.value.data.subLeaveGroup["user"];

                var i = 0;
                for (var invite of this.state.invites) {
                    if (invite.id == user.id) {
                        var newInvites = this.state.invites;
                        newInvites.splice(i, 1);
                        this.setState({
                            "invites": newInvites,
                            "sendInviteUsers": []
                        });
                        return;
                    }
                    i++;
                }

                i = 0;
                for (var groupMember of this.state.users) {
                    if (groupMember.id == user.id) {
                        var newUsers = this.state.users;
                        newUsers.splice(i, 1);
                        this.setState({
                            "users": newUsers
                        });
                        return;
                    }
                    i++;
                }
            },
            error: (error) => {
                console.log("SUBGroupLeaveERR", JSON.stringify(error));
            }
        });
    }

    subscribeToChatCreation = (props) => {
        if (this.chatCreateSubscription != null) {
            this.chatCreateSubscription.unsubscribe();
            this.chatCreateSubscription = null;
        }

        this.chatCreateSubscription = API.graphql(graphqlOperation(subscriptions.subCreateChat, { "groupName": props.groupName })).subscribe({
            next: (data) => {
                var chat = data.value.data.subCreateChat;
                for (var existingChat of this.state.chats) {
                    if (chat.id == existingChat.id) {
                        return;
                    }
                }
                var newChats = this.state.chats;
                newChats.push(chat);
                this.setState({
                    "chats": newChats
                });
            },
            error: (error) => {
                console.log("SUBGroupLeaveERR", JSON.stringify(error));
            }
        });
    }

    sendInvites() {
        var invitePromises = [];
        for (var user of this.state.sendInviteUsers) {
            invitePromises.push(API.graphql(graphqlOperation(mutations.inviteToGroup, { groupName: this.props.groupName, inviteToUserID: user.id, write: this.state.writableInvites })));
        }
        Promise.all(invitePromises).then((results) => {
            this.setState({
                inviteModal: false,
                sendInviteUsers: []
            });
        })
        .catch((ex) => {
            console.error("GROUP INVITE ERROR: ", ex);
        })
    }

    render() {
        const { classes } = this.props;
        var header = null;
        if (this.state.accepted) {
            header = (<Grid container className={classes.demo} justify="center" spacing={32} xs={12}>
                <Grid key={"0"} item className={classes.root} >
                    <Button disabled={this.state.writePrivate && !this.state.writable } onClick={() => {this.setState({ "inviteModal": true })}} variant="extendedFab" aria-label="Invite" className={classes.button}>
                        <MailIcon className={classes.extendedIcon} />
                        Invite
                    </Button>
                </Grid>
                <Grid key={"1"} item>
                    <Typography component="h2" variant="h1" gutterBottom>
                        {this.props.groupName}
                    </Typography>
                </Grid>
                <Grid key={"2"} item className={classes.root} >
                    <Button onClick={this.declineInvite.bind(this)} variant="extendedFab" aria-label="Invite" className={classes.button}>
                        <ExitToAppIcon className={classes.extendedIcon} />
                        Leave
                    </Button>
                </Grid>
            </Grid>);
        } else {
            header = (<Grid container className={classes.demo} justify="center" spacing={32} xs={12}>
                <Grid key={"0"} item className={classes.root} >
                    
                </Grid>
                <Grid key={"1"} style={{"textAlign": "center", "marginBottom": 0}} item>
                    <Typography component="h2" variant="h1" gutterBottom>
                        {this.props.groupName}
                    </Typography>
                    <Button onClick={this.acceptInvite.bind(this)} variant="extendedFab" aria-label="Invite" className={classes.button} style={{"marginTop": 0}}>
                        <AddIcon className={classes.extendedIcon} />
                        Join
                    </Button>
                </Grid>
                <Grid key={"2"} item className={classes.root} >
                    
                </Grid>
            </Grid>);
        }
        var renderInGroup = (<div>
            <Modal
                aria-labelledby="simple-modal-title"
                aria-describedby="simple-modal-description"
                open={this.state.inviteModal}
                onClose={() => { this.setState({ "inviteModal": false, "sendInviteUsers": [] }) }}>
                <div style={getModalStyle()} className={classes.modalPaper}>
                    <UserChips users={this.state.sendInviteUsers} 
                        onUserDeleted={(user, i) => {
                            var newUsers = this.state.sendInviteUsers;
                            newUsers.splice(i, 1);
                            this.setState({ "sendInviteUsers": newUsers });
                        }}
                        size={30} />
                    <UserSearcher 
                        excludedUsers={this.state.sendInviteUsers.concat(this.state.users).concat(this.state.invites)}
                        onUserSelected={(user) => {
                            var newUsers = this.state.sendInviteUsers.splice(0);
                            newUsers.push(user);
                            this.setState({
                                "sendInviteUsers": newUsers
                            });
                        }}/>
                    {
                        (this.state.writePrivate && this.state.readPrivate)? (<div>
                        <FormLabel component="legend">User Privileges</FormLabel>
                        <FormControlLabel control={<Switch
                            label="Allow Write"
                            checked={this.state.writableInvites}
                            onChange={(evt) => {this.setState({ writableInvites: evt.target.checked })}}
                            value={this.state.writableInvites}
                            />} label={(this.state.writableInvites)? "Full Access": "Read Only"} /></div>): <div />
                    }
                    <Button onClick={this.sendInvites.bind(this)}>Invite</Button>
                </div>
            </Modal>
            <Modal
                aria-labelledby="simple-modal-title"
                aria-describedby="simple-modal-description"
                open={this.state.editUser != null}
                onClose={() => { this.setState({ "editUser": null }) }}>
                <div style={getModalStyle()} className={classes.modalPaper}>
                    <Typography style={{"margin-left": 7}} variant="h4" gutterBottom>
                        {(this.state.editUser != null)? this.state.editUser.username: ""}
                    </Typography>
                    <Button onClick={() => {this.setWritable(this.state.editUser.id, !this.state.editUser.writable)}}>{(this.state.editUser != null && this.state.editUser.writable)? "Limit To Read Only": "Allow Full Access"}</Button>
                    <Button onClick={() => {this.kickUser(this.state.editUser.id)}}>Remove From Group</Button>
                </div>
            </Modal>
            <Modal
                aria-labelledby="simple-modal-title"
                aria-describedby="simple-modal-description"
                open={this.state.createChatModal}
                onClose={() => { this.setState({ "createChatModal": false }) }}>
                <div style={getModalStyle()} className={classes.modalPaper}>
                    <ChatCreator groupName={this.props.groupName} onChatCreated={ () => {this.setState({ "createChatModal": false })}}/>
                </div>
            </Modal>
            <Parallax
                bgImage={(this.state.schoolPicUrl == null)? require('./imgs/background.jpg'): this.state.schoolPicUrl}
                bgImageAlt="School"
                strength={300}>
                <br />
                {header}
            </Parallax>
            <br />
            <Grid container className={classes.demo} justify="center" spacing={32} xs={12}>
                <Grid key={"0"} item xs={6} style={{"textAlign": "center"}}>
                    <Typography style={{"margin-left": 7}} variant="h4" gutterBottom>
                        Members
                    </Typography>
                    <UserChips users={this.state.users} onUserEdit={(this.state.writable)? (user) => {this.setState({"editUser": user})}: null} size={45} />
                </Grid>
                <Grid key={"1"} item xs={6} style={{"textAlign": "center"}}>
                    {
                        (this.state.invites.length > 0)? (<Typography style={{"margin-left": 7 }} variant="h4" gutterBottom>
                            Invitations
                        </Typography>): null
                    }
                    <UserChips users={this.state.invites} size={30}  />
                </Grid>
            </Grid>
            <hr />
            <Grid container justify="center" spacing={32} xs={12}>
                <Grid key={"0"} item xs={3} style={{"textAlign": "center"}} />
                <Grid key={"0"} item xs={6} style={{"textAlign": "center"}}>
                    <Paper className={classes.paper} style={{"textAlign": "center"}}>
                        <Typography style={{"margin-left": 7, "textAlign": "center"}} variant="h3">Chats</Typography>
                        { this.state.chats.map((chat) => {
                            return (<Card className={classes.card}>
                                <CardActionArea onClick={() => { this.props.onChatOpen(chat) }}>
                                    <CardContent>
                                        <Typography variant="h5" component="h2">
                                            {chat.name}
                                        </Typography>
                                    </CardContent>
                                </CardActionArea>
                            </Card>)
                            })
                        }
                        <Button disabled={this.state.writePrivate && !this.state.writable} variant="contained" size="large" color="primary" className={classes.button} onClick={() => {this.setState({"createChatModal": true})}}>
                            Create Chat
                        </Button>
                    </Paper>
                </Grid>
                <Grid key={"0"} item xs={3} style={{"textAlign": "center"}} />
            </Grid>
        </div>);

        var renderNotInvited = (<div>
            <Grid
                container
                spacing={0}
                direction="column"
                alignItems="center"
                justify="center"
                style={{ minHeight: '100vh' }}>
                <Grid item xs={3}>
                    <h3>You Were Not Invited To This Group!</h3>
                </Grid>   
            </Grid> 
        </div>);
        var renderInvited = (<div>
            <Grid
                container
                spacing={0}
                direction="column"
                alignItems="center"
                justify="center"
                style={{ minHeight: '100vh' }}>
                <Grid item xs={3}>
                    <h3>You Were Invited To This Group!</h3>
                    <p>To see the group, you must accept the invite</p>
                    <Button variant="contained" color="primary" disabled={this.state.loading} onClick={this.acceptInvite.bind(this)} >
                        Accept
                    </Button>
                    <Button variant="contained" color="secondary" disabled={this.state.loading} onClick={this.declineInvite.bind(this)} >
                        Decline
                    </Button>
                </Grid>   
            </Grid> 
        </div>)

        if (this.state.accepted || !this.state.readPrivate) {
            return renderInGroup;
        } else if (this.state.invited) {
            return renderInvited;
        } else if (!this.state.loading) {
            return renderNotInvited;
        } else {
            return <p>Loading...</p>
        }
    }
};

Group.propTypes = {
    classes: PropTypes.object.isRequired
};

export default withStyles(styles)(Group);