import React, { Component } from 'react';
import { Button, TextField, Switch, IconButton, Snackbar, Chip, Avatar, Table, TableRow, TableCell, withStyles, FormControlLabel, TableHead, TableBody, Paper, Typography, Grow, Collapse, Fade, CircularProgress } from '@material-ui/core';
import PropTypes from 'prop-types';
import UserSearcher from './UserSearcher';
import CloseIcon from '@material-ui/icons/Close';
import UserChips from './UserChips';
import classNames from 'classnames';
import { ChatFeed, Message } from 'react-chat-ui'
import Amplify, { Storage, Auth, Hub, API, graphqlOperation } from 'aws-amplify';
import { AwsExports } from './cloud/CloudExports';
import update from 'react-addons-update';
import * as queries from './graphql/queries';
import * as mutations from './graphql/mutations';
import * as subscriptions from './graphql/subscriptions';

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
        fontSize: 'x-large',
    },
    topRightCorner: {
        position: "absolute",
        top: 0,
        right: 0,
        margin: "5px"
    },
});

class Chat extends Component {
    constructor(props) {
        super();
        this.state = {
            chatName: "",
            chatSubject: "",
            messages: [],
            picMap: {}
        };

        this.picPromises = {};
    }

    componentDidMount() {
        console.log("CHATID: ", this.props.chatID);
        API.graphql(graphqlOperation(queries.getMessages, { "chatID": this.props.chatID })).then((resp) => {
            this.subscribeToMessages();
            console.log("RESP: ", resp);
            var messages = resp.data.getMessages["messages"];
            var senders = resp.data.getMessages["senders"];
            var newMessages = [];
            for (var sender of senders) {
                this.getUserProfPic(sender);
            }
            for (var message of messages) {
                var msgSender = null;
                for (var sender of senders) {
                    if (sender.id == message.senderID) {
                        msgSender = sender;
                        break;
                    }
                }
                newMessages.push( { "message": message, "sender": msgSender } );
            }
            console.log("MSG RES", newMessages);
            this.setState({ "messages": newMessages });
        }).catch((err) => {
            console.error("GetMessages error:", err);
        });
    }

    componentWillUnmount() {
        if (this.messageCreateSubscription != null) {
            this.messageCreateSubscription.unsubscribe();
            this.messageCreateSubscription = null;
        }
    }

    hashCode(str) {
        var hash = 0, i, chr;
        if (str.length === 0) return hash;
        for (i = 0; i < str.length; i++) {
            chr   = str.charCodeAt(i);
            hash  = ((hash << 5) - hash) + chr;
            hash |= 0;
        }
        return hash;
    };

    dbMessageToUIMessage(dbMsg) {
        var userNum = this.hashCode(this.state.userToNumMap[dbMsg.sender.id]);
        return new Message({ id: userNum, message: dbMsg.message.text, senderName: dbMsg.sender.username });
    }

    createMessage() {
        var msgText = this.state.msgText;
        var objKey = this.state.msgObjKey;
        this.setState({
            msgText: "",
            msgObjKey: null
        });
        API.graphql(graphqlOperation(mutations.createMessage, {chatID: this.props.chatID, text: msgText, objKey: objKey, creationEpochSecs: (Math.round(Date.now() / 1000)) })).then((message) => {
            console.log("MESSAGE CREATED");
        }).catch((err) => {
            console.error("Create Msg ERR: ", err);
        });
    }

    subscribeToMessages() {
        if (this.messageCreateSubscription != null) {
            this.messageCreateSubscription.unsubscribe();
            this.messageCreateSubscription = null;
        }

        this.messageCreateSubscription = API.graphql(graphqlOperation(subscriptions.subCreateMessage, { "chatID": this.props.chatID })).subscribe({
            next: (data) => {
                var message = data.value.data.subCreateMessage;
                this.getUserProfPic(message.sender);
                for (var existingMessage of this.state.messages) {
                    if (existingMessage.message.id == message.message.id) {
                        return;
                    }
                }
                var newMessages = [message].concat(this.state.messages);
                this.setState({
                    "messages": newMessages
                });
            },
            error: (error) => {
                console.log("SUBGroupLeaveERR", JSON.stringify(error));
            }
        });
    }

    getUserProfPic(user) {
        if (user.picKey != null && this.picPromises[user.id] == null) {
            var uid = user.id;
            this.picPromises[user.id] = Storage.get(user.picKey.substr(7), { level: 'public' })
                .then(picResult => {
                    this.setState({ "picMap": update(this.state.picMap, { [uid]: {$set: picResult}}) });
                })
                .catch(err => console.error("GET PIC ERR: " + err));
        }
    }

    render() {
        const { classes } = this.props;
        var msgCollection = [];
        var msgCollectionSender = null;
        var msgCollectionElms = [];
        var addMsgCollectionElm = () => {
            var msgElms = [];
            var i = 0;
            for (var m of msgCollection) {
                var msgStyle = null;
                var msgTextStyle = { 
                    "padding": 15, "display": "inline-block", 
                    "box-shadow": "rgba(0,0,0,0.2) 0px 2px 3px, inset rgba(0,0,0,0.2) 0px -1px 2px",
                    "border-radius": 20, "margin-top": 2, "margin-bottom": 2};
                if (this.props.userID == msgCollectionSender.id) {
                    msgStyle = { "margin-left" : "auto", "margin-right": 0, "textAlign": "right" };
                    msgTextStyle["background"] = "#89CFF0";
                } else {
                    msgStyle = { "margin-right" : "auto", "margin-left": 0, "textAlign": "left" };
                    msgTextStyle["background"] = "#ffa64d";
                }
                if (msgCollection.length > 1) {
                    if (i == 0) {
                        if (this.props.userID == msgCollectionSender.id) {
                            msgTextStyle["border-bottom-right-radius"] = 0;
                        } else {
                            msgTextStyle["border-bottom-left-radius"] = 0;
                        }
                    } else if (i == msgCollection.length - 1) {
                        if (this.props.userID == msgCollectionSender.id) {
                            msgTextStyle["border-top-right-radius"] = 0;
                        } else {
                            msgTextStyle["border-top-left-radius"] = 0;
                        }
                    } else {
                        if (this.props.userID == msgCollectionSender.id) {
                            msgTextStyle["border-top-right-radius"] = 0;
                            msgTextStyle["border-bottom-right-radius"] = 0;
                        } else {
                            msgTextStyle["border-top-left-radius"] = 0;
                            msgTextStyle["border-bottom-left-radius"] = 0;
                        }
                    }
                }
                msgElms.push(
                    <div style={msgStyle}>
                        <p style={msgTextStyle}>{m.text}</p>
                    </div>);
                i++;
            }
            if (this.props.userID == msgCollectionSender.id) {
                msgCollectionElms.push(<div style={{"margin-right": 20}}>
                    {msgElms}
                </div>);
            } else {
                msgCollectionElms.push(
                <div>
                    <Typography variant="overline" style={{ "margin-left": 42, "margin-bottom": -2 }}>
                        {msgCollectionSender.username}
                    </Typography>
                    <div style={{"margin-left": 42}}>
                        {msgElms}
                    </div>
                    <Avatar style={{"margin-top": -42}} src={this.state.picMap[msgCollectionSender.id]} className={classNames(classes.blueAvatar, classes.bigAvatar)}>{msgCollectionSender.username.substr(0, 1).toUpperCase()}</Avatar>
                </div>);
            }
            msgCollection = [];
        }
        this.state.messages.map((msg) => {
            if (msgCollectionSender != null && msgCollectionSender.id != msg.sender.id) {
                addMsgCollectionElm();
            }
            msgCollectionSender = msg.sender;
            msgCollection = [msg.message].concat(msgCollection);
        });
        if (msgCollection.length > 0) {
            addMsgCollectionElm();
        }
        return (<div style={{"display": "flex", "justify-content": "flex-end", "flex-direction": "column", "width": "100%", "height": 500}}>
            <div style={{"width": "100%", 
                "background": "#89CFF0", 
                "overflow": "hidden",
                "box-shadow": "rgba(0,0,0,0.2) 0px 2px 3px, inset rgba(0,0,0,0.2) 0px -1px 2px",
                "border-top-right-radius": 20,
                "border-top-left-radius": 20,
                "display": "inline",
                "position": "absolute",
                "top": 0,
                "right": 0,
                "zIndex": 100000 }}>
                <Typography variant="h4" style={{ "margin-left": 20, "display": "inline-block" }}>
                    {this.props.chatName}
                </Typography>
                <IconButton
                        key="close"
                        aria-label="Close"
                        color="inherit"
                        className={classes.close}
                        onClick={this.props.onClose}
                        style={{"position": "absolute",
                            "top": 0,
                            "right": 0}}>
                    <CloseIcon />
                </IconButton>
            </div>
            <div style={{"width": "100%", "height": "auto", "overflow": "scroll", "postion": "absolute", "bottom": 100, 
                "left": 0, "overflow": "auto", "display": "flex", "flex-direction": "column-reverse", "margin-top": 45}}>
                {msgCollectionElms}
            </div>
            <TextField
                className={classes.textField}
                value={this.state.msgText}
                onChange={(evt) => {this.setState({ msgText: evt.target.value })}}
                margin="normal"
                style={{"color": "#FFFFFF", "postion": "absolute", "bottom": 0, "left": 0}}
                multiline={true}
                rowsMax={3}
                placeholder="Your Message"
                onKeyPress={(ev) => {
                    if (ev.key === 'Enter') {
                      this.createMessage();
                      ev.preventDefault();
                    }
                }}
            />
        </div>);
    }
};

Chat.propTypes = {
    classes: PropTypes.object.isRequired
};

export default withStyles(styles)(Chat);