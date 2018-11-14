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
import Amplify, { API, graphqlOperation } from "aws-amplify";
import { AwsExports } from './cloud/CloudExports';
import * as queries from './graphql/queries';
import * as mutations from './graphql/mutations';

import { Modal, Button, Table, TableRow, TableCell, TableHead, TableBody,  Grow, Collapse, Fade, CircularProgress } from '@material-ui/core';


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
    invitations: []
  };
  
  componentWillMount() {
    if (this.props["syllaToken"] != null) {
      this.getInvites();
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps["syllaToken"] != null) {
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
      this.setState({ "invitations": invites });
    }).catch((err) => {
      console.error("GetGroups error:", err);
    })
  }

  acceptInvite(invitation) {

  }

  removeInvite(invitation) {

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
              this.state.invitations.map((invitation, i) => {
                return (
                  <TableRow>
                    <TableCell><p>{invitation.name}</p></TableCell>
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
                        onClick={() => { this.removeInvite(invitation) }}>
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

    return (
      <div className={classes.root}>
        {renderInviteMenu}
        <AppBar position="fixed">
          <Toolbar>
            <IconButton className={classes.menuButton} color="inherit" aria-label="Open drawer">
              <MenuIcon />
            </IconButton>
            <Typography className={classes.title} variant="h6" color="inherit" noWrap>
              SyllaShare
            </Typography>
            <UserSearcher excludedUsers={[]} />
            <div className={classes.grow} />
            <div className={classes.sectionDesktop}>
              <IconButton 
                color="inherit" 
                onClick={ (event) => { this.setState({ "inviteMenuAnchor": event.currentTarget })} }
                aria-owns={this.state.inviteMenuAnchor ? 'invite-menu' : undefined}
                aria-haspopup="true">
                <Badge badgeContent={this.state.invitations.length} color="secondary">
                  <MailIcon />
                </Badge>
              </IconButton>
              <IconButton color="inherit">
                <Badge badgeContent={17} color="secondary">
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