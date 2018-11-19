import React, { Component } from 'react';
import { Table, TableRow, TableCell, withStyles, TableHead, TableBody, Paper, Typography, Grow, Collapse, Fade, CircularProgress } from '@material-ui/core';
import PropTypes from 'prop-types';

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

class ClassEdit extends Component {
    constructor(props) {
        super();
        this.state = {
            rows: [
                { "id": "2314", "name": 'Software Engineering', "teacher": "Yu Sun", "times": "T TH 1:00-2:15"}
            ]
        };
    }

    componentWillMount() {
        var params = {};
        var body = {};

    }

    render() {
        const { classes } = this.props;
        return (<div>
        </div>);
    }
};

ClassEdit.propTypes = {
    classes: PropTypes.object.isRequired
};

export default withStyles(styles)(ClassEdit);