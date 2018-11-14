import React, { Component } from 'react';
import { Button, TextField, Switch, Chip, Avatar, Table, TableRow, TableCell, withStyles, FormControlLabel, TableHead, TableBody, Paper, Typography, Grow, Collapse, Fade, CircularProgress } from '@material-ui/core';
import PropTypes from 'prop-types';
import classNames from 'classnames';

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

class UserChips extends Component {
    constructor(props) {
        super();
    }

    render() {
        const { classes } = this.props;
        return (<div>
            {this.props.users.map((user, i) => {
                return(<Chip
                avatar={ <Avatar src={user.picSigned} className={classNames(classes.blueAvatar, classes.bigAvatar)}>T</Avatar>}
                label={user.username}
                onDelete={() => {
                    this.props.onUserDeleted(user, i);
                }}
                className={classes.chip}
                />);
            })}
        </div>);
    }
};

UserChips.propTypes = {
    classes: PropTypes.object.isRequired
};

export default withStyles(styles)(UserChips);