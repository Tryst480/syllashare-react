import React, { Component } from 'react';
import { Button, TextField, Switch, Chip, Avatar, Table, TableRow, TableCell, withStyles, FormControlLabel, TableHead, TableBody, Paper, Typography, Grow, Collapse, Fade, CircularProgress } from '@material-ui/core';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import update from 'react-addons-update';
import Amplify, { Storage, Auth, Hub, API, graphqlOperation } from 'aws-amplify';
import { AwsExports } from './cloud/CloudExports';

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
    }
});

class UserChips extends Component {
    constructor(props) {
        super();
        this.state = {
            picMap: {}
        };
        this.getUserProfPics(props.users);
    }

    componentWillReceiveProps(nextProps) {
        var newUsers = [];
        for (var user of nextProps.users) {
            for (var existingUser of this.props.users) {
                var exists = false;
                if (existingUser.id == user.id) {
                    exists = true;
                    break;
                }
                if (!exists) {
                    newUsers.push(user);
                }
            }
        }
        this.getUserProfPics(newUsers);
    }

    getUserProfPics(users) {
        for (var user of users) {
            console.log("GET PROF PIC: ", user);
            if (user.picKey != null && user.picSigned == null && this.state.picMap[user.id] == null) {
                var uid = user.id;
                Storage.get(user.picKey.substr(7), { level: 'public' })
                    .then(picResult => {
                        this.setState({ "picMap": update(this.state.picMap, { [uid]: {$set: picResult}}) });
                    })
                    .catch(err => console.error("GET PIC ERR: " + err));
            }
        }
    }

    render() {
        const { classes } = this.props;
        return (<div>
            {this.props.users.map((user, i) => {
                return(<Chip
                avatar={ <Avatar style={{"height": this.props.size, "width": this.props.size, "font-size": (this.props.size * 0.55) }} src={(user.picSigned != null)? user.picSigned: this.state.picMap[user.id]} className={classNames(classes.blueAvatar, classes.bigAvatar)}>{user.username.substr(0, 1).toUpperCase()}</Avatar>}
                label={user.username}
                onDelete={ (this.props.onUserDeleted != null)? () => { this.props.onUserDeleted(user, i) }: null }
                className={classes.chip}
                style={{"height": this.props.size, "font-size": (this.props.size * 0.55), "margin": (this.props.size / 4), "border-radius": (this.props.size/2)}}
                />);
            })}
        </div>);
    }
};

UserChips.propTypes = {
    classes: PropTypes.object.isRequired
};

export default withStyles(styles)(UserChips);