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
            <Paper className={classes.root}>
                <Table className={classes.table}>
                    <TableHead>
                        <TableRow>
                            <TableCell>Name</TableCell>
                            <TableCell>Teacher</TableCell>
                            <TableCell>Times</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {this.state.rows.map(row => {
                            return (
                                <TableRow key={row.id} onClick={() => this.props.profile.setState({
                                    mainPage: true,
                                    classEdit: false

                                })}>
                                    <TableCell component="th" scope="row">
                                        {row.name}
                                    </TableCell>
                                    <TableCell>{row.teacher}</TableCell>
                                    <TableCell>{row.times}</TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </Paper>
        </div>);
    }
};

ClassEdit.propTypes = {
    classes: PropTypes.object.isRequired
};

export default withStyles(styles)(ClassEdit);