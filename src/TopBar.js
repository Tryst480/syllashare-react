import React from 'react';
import PropTypes from 'prop-types';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';
import Autosuggest from 'react-autosuggest';
import Badge from '@material-ui/core/Badge';
import MenuItem from '@material-ui/core/MenuItem';
import Menu from '@material-ui/core/Menu';
import { fade } from '@material-ui/core/styles/colorManipulator';
import { withStyles } from '@material-ui/core/styles';
import MenuIcon from '@material-ui/icons/Menu';
import SearchIcon from '@material-ui/icons/Search';
import AccountCircle from '@material-ui/icons/AccountCircle';
import MailIcon from '@material-ui/icons/Mail';
import NotificationsIcon from '@material-ui/icons/Notifications';
import MoreIcon from '@material-ui/icons/MoreVert';
import deburr from 'lodash/deburr';
import TextField from '@material-ui/core/TextField';
import match from 'autosuggest-highlight/match';
import parse from 'autosuggest-highlight/parse';
import Paper from '@material-ui/core/Paper';
import Popper from '@material-ui/core/Popper';
import CheckIcon from '@material-ui/icons/Check';
import CloseIcon from '@material-ui/icons/Close';
import UserSearcher from './UserSearcher';
import ClassSearcher from './ClassSearcher';
import Amplify, { API, graphqlOperation } from "aws-amplify";
import { AwsExports } from './cloud/CloudExports';
import * as queries from './graphql/queries';
import * as mutations from './graphql/mutations';
import * as subscriptions from './graphql/subscriptions';

import { Modal, Button, FormControl, InputLabel, Select, Table, TableRow, TableCell, TableHead, TableBody,  Grow, Collapse, Fade, CircularProgress } from '@material-ui/core';
import GroupSearcher from './GroupSearcher';


Amplify.configure(AwsExports);

const styles = theme => ({
  root: {
    width: '100%',
  },
  grow: {
    flexGrow: 1,
  },
  menuButton: {
    marginLeft: -12,
    marginRight: 20,
  },
  formControl: {
    margin: theme.spacing.unit,
    minWidth: 120,
  },
  title: {
    display: 'none',
    'font-size': 'x-large',
    [theme.breakpoints.up('sm')]: {
      display: 'block',
    },
  },
  search: {
    position: 'relative',
    borderRadius: theme.shape.borderRadius,
    backgroundColor: fade(theme.palette.common.white, 0.15),
    '&:hover': {
      backgroundColor: fade(theme.palette.common.white, 0.25),
    },
    marginRight: theme.spacing.unit * 2,
    marginLeft: 0,
    width: '100%',
    [theme.breakpoints.up('sm')]: {
      marginLeft: theme.spacing.unit * 3,
      width: 'auto',
    },
  },
  searchIcon: {
    width: theme.spacing.unit * 9,
    height: '100%',
    position: 'absolute',
    pointerEvents: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputRoot: {
    color: 'inherit',
    width: '100%',
  },
  inputInput: {
    paddingTop: theme.spacing.unit,
    paddingRight: theme.spacing.unit,
    paddingBottom: theme.spacing.unit,
    paddingLeft: theme.spacing.unit * 10,
    transition: theme.transitions.create('width'),
    width: '100%',
    [theme.breakpoints.up('md')]: {
      width: 200,
    },
  },
  sectionDesktop: {
    display: 'none',
    [theme.breakpoints.up('md')]: {
      display: 'flex',
    },
  },
  sectionMobile: {
    display: 'flex',
    [theme.breakpoints.up('md')]: {
      display: 'none',
    },
  },
  rootAuto: {
    height: 250,
    flexGrow: 1,
  },
  container: {
    position: 'relative',
  },
  suggestionsContainerOpen: {
    position: 'absolute',
    zIndex: 1,
    marginTop: theme.spacing.unit,
    left: 0,
    right: 0,
  },
  suggestion: {
    display: 'block',
  },
  suggestionsList: {
    margin: 0,
    padding: 0,
    listStyleType: 'none',
  },
  divider: {
    height: theme.spacing.unit * 2,
  },
});

class TopBar extends React.Component {
  state = {
    inviteMenuAnchor: null,
    single: '',
    popper: '',
    invites: [],
    searchMode: 'users'
  };
  
  componentWillMount() {
    if (this.props["syllaToken"] != null) {
      this.subscribeToInvites(this.props);
      this.getInvites();
    }
  }

  componentWillUnmount() {
    if (this.inviteSubscription != null) {
      this.inviteSubscription.unsubscribe();
      this.inviteSubscription = null;
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps["syllaToken"] != null) {
      this.subscribeToInvites(nextProps);
      this.getInvites();
    }
  }

  getInvites() {
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
      this.setState({ "invites": invites });
    }).catch((err) => {
      console.error("GetGroups error:", err);
    })
  }

  subscribeToInvites(props) {
    if (this.inviteSubscription != null) {
        this.inviteSubscription.unsubscribe();
        this.inviteSubscription = null;
    }
    var subReq = graphqlOperation(subscriptions.subUserInviteToGroup, { "userID": props.userID })
    console.log("SUBREQ: ", subReq);
    this.inviteSubscription = API.graphql(subReq).subscribe({
        next: (groupUserPair) => {
            console.log("GOT NEW INVITE TOP: ", groupUserPair);
            var group = groupUserPair.value.data.subUserInviteToGroup["group"];
            //Check if group is already added
            for (var invite of this.state.invites) {
              if (invite.name == group.name) {
                return;
              }
            }
            var newInvites = this.state.invites;
            newInvites.push({ "name": group.name, "visibility": ((group.private)? "Private": "Public"), "members": group.users.length });
            this.setState({
                invites: newInvites
            });
        },
        error: (error) => {
            console.log("SUBInviteERR", JSON.stringify(error));
        }
    }) 
  }

  acceptInvite(invite) {
    API.graphql(graphqlOperation(mutations.joinGroup, {groupName: invite.name })).then((groupUserPair) => {
      console.log("Joined Group", JSON.stringify(groupUserPair));
      var i = 0;
      for (var it of this.state.invites) {
          if (it.name == invite.name) {
              var newInvites = this.state.invites;
              newInvites.splice(i, 1);
              this.setState({
                  invites: newInvites
              });
              return;
          }
          i++;
      }
    }).catch((err) => {
        console.error("Join Group ERR: ", err);
    })
  }

  declineInvite(invite) {
    API.graphql(graphqlOperation(mutations.leaveGroup, {groupName: invite.name })).then((groupUserPair) => {
      console.log("LEFT GROUP: ", JSON.stringify(groupUserPair));
      var i = 0;
      for (var it of this.state.invites) {
          if (it.name == invite.name) {
              var newInvites = this.state.invites;
              newInvites.splice(i, 1);
              this.setState({
                  invites: newInvites
              });
              return;
          }
          i++;
      }
    }).catch((err) => {
        console.error("Leave Group ERR: ", err);
    })
  }

  render() {
    const { classes } = this.props;

    const renderInviteMenu = (
      <Menu
        id="invite-menu"
        anchorEl={this.state.inviteMenuAnchor}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        open={this.state.inviteMenuAnchor != null}
        onClose={() => {
          this.setState({
            inviteMenuAnchor: null
          });
        }}
      >
        <Table>
          <TableBody>
            {
              this.state.invites.map((invitation, i) => {
                return (
                  <TableRow>
                    <TableCell><p style={{ "font-size": 10, "margin-bottom": -8 }}>Join Group:</p><p>{invitation.name}</p></TableCell>
                    <TableCell>
                    <IconButton
                        key="check"
                        aria-label="Check"
                        color="inherit"
                        className={classes.close}
                        onClick={() => { this.acceptInvite(invitation) }}>
                        <CheckIcon />
                      </IconButton>
                      <IconButton
                        key="close"
                        aria-label="Close"
                        color="inherit"
                        className={classes.close}
                        onClick={() => { this.declineInvite(invitation) }}>
                        <CloseIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>)
              })
            }
          </TableBody>
        </Table>
      </Menu>
    );

    var searchBar = null;
    if (this.state.searchMode == "users") {
      searchBar = <UserSearcher excludedUsers={[this.props.userID]} onUserSelected={(user) => {this.props.onUserSelected(user.id)}} />
    } else if (this.state.searchMode == "groups") {
      searchBar = <GroupSearcher onGroupSelected={(group) => {this.props.onGroupSelected(group.name)}} />
    } else {
      searchBar = <ClassSearcher onClassCreate={this.props.onClassCreate} onClassSelected={this.props.onClassSelected} />
    }

    return (
      <div className={classes.root}>
        {renderInviteMenu}
        <AppBar position="fixed">
          <Toolbar>
            <IconButton className={classes.menuButton} color="inherit" aria-label="Open drawer">
              <MenuIcon />
            </IconButton>
            <Typography className={classes.title} onClick={this.props.onTitleClicked} variant="h6" color="inherit" noWrap>
              SyllaShare
            </Typography>
            {
              searchBar
            }
            
            <FormControl className={classes.formControl}>
              <InputLabel style={{"color": "white"}} htmlFor="searchMode-simple">SearchMode</InputLabel>
              <Select
                style={{"color": "white"}}
                value={this.state.searchMode}
                onChange={(e) => {this.setState({searchMode: e.target.value})}}
                inputProps={{
                  name: 'searchMode',
                  id: 'searchMode-simple',
                }}
              >
                <MenuItem value={"users"}>
                  Users
                </MenuItem>
                <MenuItem value={"groups"}>
                  Groups
                </MenuItem>
                <MenuItem value={"classes"}>
                  Classes
                </MenuItem>
              </Select>
            </FormControl>
            <div className={classes.grow} />
            <div className={classes.sectionDesktop}>
              <IconButton 
                color="inherit" 
                onClick={ (event) => { this.setState({ "inviteMenuAnchor": event.currentTarget })} }
                aria-owns={this.state.inviteMenuAnchor ? 'invite-menu' : undefined}
                aria-haspopup="true">
                <Badge badgeContent={this.state.invites.length} color="secondary">
                  <MailIcon />
                </Badge>
              </IconButton>
              <IconButton color="inherit">
                <Badge badgeContent={0} color="secondary">
                  <NotificationsIcon />
                </Badge>
              </IconButton>
            </div>
          </Toolbar>
        </AppBar>
      </div>
    );
  }
}

TopBar.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(TopBar);