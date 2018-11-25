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
            classes: []
        };
    }

    componentWillMount() {
        API.graphql(graphqlOperation(queries.getUserClasses, { "userID": this.props.userID })).then((data) => {
            console.log("RESULT: ", data);
            this.setState({ "classes": data.data.getUserClasses });
        }).catch((err) => {
            console.error("GetClasses error:", err);
        });
    }

    render() {
        const { classes } = this.props;
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
                    </Table>): <div />
                    }
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