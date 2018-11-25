import React, { Component } from 'react';
import { Table, TableRow, TableCell, withStyles, TableHead, TableBody, Paper, Typography, Grow, Collapse, Fade, CircularProgress } from '@material-ui/core';
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

class CourseClasses extends Component {
    constructor(props) {
        super();
        this.state = {
            classes: []
        };
    }

    componentWillMount() {
        API.graphql(graphqlOperation(queries.getClasses, { "courseID": this.props.courseID })).then((data) => {
            this.setState({ "classes": data.data.getClasses });
        }).catch((err) => {
            console.error("GetClasses error:", err);
        });
    }

    render() {
        const { classes } = this.props;
        return (<div>
            {(this.state.classes.length > 0)? (
            <Paper className={classes.root}>
                <Table className={classes.table}>
                    <TableHead>
                        <TableRow>
                            <TableCell>Teacher</TableCell>
                            <TableCell>Times</TableCell>
                            <TableCell>Term</TableCell>
                            <TableCell>Year</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                    {this.state.classes.map(c => {
                        return (
                        <TableRow key={c.id}>
                            <TableCell component="th" scope="row">
                                {c.teacher.name}
                            </TableCell>
                            <TableCell>{c.timeStr}</TableCell>
                            <TableCell>{c.term}</TableCell>
                            <TableCell>{c.year}</TableCell>
                        </TableRow>
                        );
                    })}
                    </TableBody>
                </Table>
                </Paper>): <h4>No Classes...</h4>
            }
        </div>);
    }
};

CourseClasses.propTypes = {
    classes: PropTypes.object.isRequired
};

export default withStyles(styles)(CourseClasses);