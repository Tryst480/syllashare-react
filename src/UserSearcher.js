import React from 'react';
import PropTypes from 'prop-types';
import Autosuggest from 'react-autosuggest';
import { fade } from '@material-ui/core/styles/colorManipulator';
import { TextField, withStyles, Switch, Avatar } from '@material-ui/core';
import BackendExports from './BackendExports';
import classNames from 'classnames';
import Amplify, { Storage, Auth, Hub, API } from 'aws-amplify';
import { AwsExports, GcpExports } from './cloud/CloudExports';
import update from 'react-addons-update';
Amplify.configure(AwsExports);

const styles = theme => ({
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
  }
});
class UserSearcher extends React.Component {
  state = {
    anchorEl: null,
    mobileMoreAnchorEl: null,
    searchValue: '',
    searchSuggestions: [],
    picMap: {}
  };
   // Autosuggest will call this function every time you need to update suggestions.
  // You already implemented this logic above, so just use it.
  onSuggestionsFetchRequested = ({ value }) => {
    if (value.length > 0) {
      fetch(BackendExports.Url + '/api/searchusers?query=' + value, 
      {
          method: 'GET',
          headers: new Headers({
              "authorization": this.props.syllaToken
          }),
          credentials: 'include'
      })
      .then((response) => {
        return response.json();
      })
      .then((response) => {
        console.log("RESPONSE: ", response);
        var searchUsers = [];
        for (var user of response) {
          if (this.props.excludedUsers[user.username] == null) {
            searchUsers.push(user);
            console.log("ITER USER: ", user.pickey);
            if (user.pickey != null && this.state.picMap[user.username] == null) {
              console.log("STORAGE REQ");
              Storage.get(user.pickey.substr(7), { level: 'public' })
              .then(picResult => {
                this.setState({ "picMap": update(this.state.picMap, { [user.username]: {$set: picResult}}) });
              })
              .catch(err => console.error("GET PIC ERR: " + err));
            }
          }
        }
        this.setState({
          searchSuggestions: searchUsers
        });
      }).catch((err) => {
        console.error("GetUser Ex: ", err);
        this.setState({
          searchSuggestions: []
        });
      });
    }
  };
   // Autosuggest will call this function every time you need to clear suggestions.
  onSuggestionsClearRequested = () => {
    this.setState({
      searchSuggestions: []
    });
  };

  render() {
    const { classes } = this.props;

     // Autosuggest will pass through all these props to the input.
    const inputProps = {
      placeholder: 'Search Users',
      value: this.state.searchValue,
      onChange: (event, { newValue }) => {
        this.setState({
            searchValue: typeof newValue !== 'undefined' ? newValue : '',
        });
      }
    };
     return (
        <div className={classes.search}>
          <Autosuggest
            suggestions={this.state.searchSuggestions}
            onSuggestionsFetchRequested={this.onSuggestionsFetchRequested}
            onSuggestionsClearRequested={this.onSuggestionsClearRequested}
            getSuggestionValue={(suggestion) => {return suggestion.username}}
            onSuggestionSelected={(event, args) => {
              event.stopPropagation();
              args.suggestion.picSigned = this.state.picMap[args.suggestion.username]
              this.props.onUserSelected(args.suggestion);
            }}
            renderSuggestion={(suggestion) => {
                return (<div>
                  <Avatar style={{"float": "left"}} src={this.state.picMap[suggestion.username]} className={classNames(classes.blueAvatar, classes.bigAvatar)}>{suggestion.username.substr(0, 1).toUpperCase()}</Avatar>
                  <p>{suggestion.username}</p>
                </div>)
            }}
            inputProps={inputProps}
            />
        </div>
    );
  }
}
UserSearcher.propTypes = {
  classes: PropTypes.object.isRequired,
};
 export default withStyles(styles)(UserSearcher); 