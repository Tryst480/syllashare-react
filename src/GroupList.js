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

class GroupList extends Component {
    constructor(props) {
        super();
        this.state = {
            rows: [
                { "id": "2314", "name": 'Tryst', "availability": "Public", "members": 5 }
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
                            <TableCell>Availability</TableCell>
                            <TableCell numeric>Members</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                    {this.state.rows.map(row => {
                        return (
                        <TableRow key={row.id}>
                            <TableCell component="th" scope="row">
                            {row.name}
                            </TableCell>
                            <TableCell>{row.availability}</TableCell>
                            <TableCell numeric>{row.members}</TableCell>
                        </TableRow>
                        );
                    })}
                    </TableBody>
                </Table>
                </Paper>
        </div>);
    }
};

GroupList.propTypes = {
    classes: PropTypes.object.isRequired
};

export default withStyles(styles)(GroupList);