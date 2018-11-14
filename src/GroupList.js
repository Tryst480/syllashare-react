import React, { Component } from 'react';
import { Modal, Button, Table, TableRow, TableCell, withStyles, TableHead, TableBody, Paper, Typography, Grow, Collapse, Fade, CircularProgress } from '@material-ui/core';
import PropTypes from 'prop-types';
import Amplify, { API, graphqlOperation } from "aws-amplify";
import { AwsExports } from './cloud/CloudExports';
import * as queries from './graphql/queries';
import * as mutations from './graphql/mutations';
import GroupAdder from './GroupAdder';

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

class GroupList extends Component {
    constructor(props) {
        super();
        this.state = {
            groups: [],
            invites: []
        };
    }

    componentWillMount() {
        console.log("GETTING GROUPS");
        API.graphql(graphqlOperation(queries.getGroups)).then((myGroups) => {
            console.log("GOT GROUPS: ", myGroups.data.getGroups)
            var groups = [];
            var invites = [];
            for (var groupEntry of myGroups.data.getGroups) {
                var group = groupEntry.group;
                if (groupEntry.accepted) {
                    groups.push({ "name": group.name, "visibility": ((group.private)? "Private": "Public"), "members": group.users.length + 1 })
                } else {
                    invites.push({ "name": group.name, "visibility": ((group.private)? "Private": "Public"), "members": group.users.length + 1 })
                }
            }
            this.setState({ "groups": groups, "invites": invites });
        }).catch((err) => {
            console.error("GetGroups error:", err);
        })
    }

    acceptInvite(invite) {

    }

    declineInvite(invite) {
        
    }

    render() {
        const { classes } = this.props;

        var renderInviteList = this.state.invites.length > 0? (
            <Table className={classes.table}>
                <TableHead>
                    <TableRow>
                        <TableCell><b>Group Invitations</b></TableCell>
                        <TableCell></TableCell>
                        <TableCell></TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                {this.state.invites.map((invite) => {
                    return (<TableRow>
                        <TableCell>{invite.name}</TableCell>
                        <TableCell><Button onClick={() => {this.acceptInvite(invite)}}>Accept</Button></TableCell>
                        <TableCell><Button onClick={() => {this.declineInvite(invite)}}>Decline</Button></TableCell>
                    </TableRow>)
                })}
                </TableBody>
            </Table>
        ): <div />;

        return (<div>
            <Modal
                aria-labelledby="simple-modal-title"
                aria-describedby="simple-modal-description"
                open={this.state.addingGroup}
                onClose={() => { this.setState({ addingGroup: false }) }}>
                <div style={getModalStyle()} className={classes.modalPaper}>
                    <GroupAdder myUsername={this.props.myUsername}/>
                </div>
            </Modal>
            <Paper className={classes.root}>
                <Table className={classes.table}>
                    <TableHead>
                        <TableRow>
                            <TableCell>Name</TableCell>
                            <TableCell>Visibility</TableCell>
                            <TableCell>Members</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                    {this.state.groups.map(row => {
                        return (
                        <TableRow key={row.id}>
                            <TableCell component="th" scope="row">
                            {row.name}
                            </TableCell>
                            <TableCell>{row.visibility}</TableCell>
                            <TableCell>{row.members}</TableCell>
                        </TableRow>
                        );
                    })}
                    </TableBody>
                </Table>
                
                {renderInviteList}
                <Button color="primary" 
                  aria-label="Add" className={classes.button}
                  onClick={() => {this.setState({ "addingGroup": true })}}>
                  Create Group
                </Button>
            </Paper>
        </div>);
    }
};

GroupList.propTypes = {
    classes: PropTypes.object.isRequired
};

export default withStyles(styles)(GroupList);