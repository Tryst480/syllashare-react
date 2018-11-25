import React, { Component } from 'react';
import { Table, TableRow, TableCell, Button, withStyles, TableHead, TableBody, Paper, Typography, Grow, Collapse, Fade, CircularProgress } from '@material-ui/core';
import PropTypes from 'prop-types';
import Amplify, { API, graphqlOperation } from "aws-amplify";
import Group from "./Group";
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

class ClassGroup extends Component {
    constructor(props) {
        super();
        this.state = {
            classes: []
        };
    }

    componentWillMount() {
        console.log("ClassID: ", this.props.classID);
        API.graphql(graphqlOperation(queries.getClass, { "classID": this.props.classID })).then((data) => {
            console.log("GOT CLASS:", data);
            this.setState({ "class": data.data.getClass });
        }).catch((err) => {
            console.error("GetClasses error:", err);
        });
    }

    render() {
        const { classes } = this.props;
        if (this.state.class != null) {
            return (<div>
                <Group 
                    groupName={this.props.classID}
                    userID={this.props.userID}
                    onChatOpen={this.props.onChatOpen}
                    onUserSelected={this.props.onUserSelected}
                    onLeave={this.props.onLeave}
                    key={this.props.classID}>
                    <h1>{this.state.class.course.id}</h1>
                </Group>
            </div>);
        } else {
            return <div />;
        }
    }
};

ClassGroup.propTypes = {
    classes: PropTypes.object.isRequired
};

export default withStyles(styles)(ClassGroup);