import React from 'react';
import PropTypes from 'prop-types';
import Autosuggest from 'react-autosuggest';
import { fade } from '@material-ui/core/styles/colorManipulator';
import { TextField, withStyles, Switch, Avatar } from '@material-ui/core';
import BackendExports from './BackendExports';
import classNames from 'classnames';
import Amplify, { Storage, Auth, Hub, API, graphqlOperation } from 'aws-amplify';
import { AwsExports, GcpExports } from './cloud/CloudExports';
import * as queries from './graphql/queries';
import * as mutations from './graphql/mutations';
import * as subscriptions from './graphql/subscriptions';
import update from 'react-addons-update';

Amplify.configure(AwsExports);

const styles = theme => ({
  search: {
    borderRadius: theme.shape.borderRadius,
    backgroundColor: fade(theme.palette.common.white, 0.15),
    '&:hover': {
      backgroundColor: fade(theme.palette.common.white, 0.25),
    },
    marginRight: theme.spacing.unit * 2,
    marginLeft: 0,
    width: '100%',
    [theme.breakpoints.up('sm')]: {
      color: 'red'
    },
  }
});
class TeacherSearcher extends React.Component {
  state = {
    searchValue: '',
    searchSuggestions: []
  };
   // Autosuggest will call this function every time you need to update suggestions.
  // You already implemented this logic above, so just use it.
  onSuggestionsFetchRequested = ({ value }) => {
    if (value.length > 0) {
        API.graphql(graphqlOperation(queries.searchTeachers, { "query": value })).then((resp) => {
            var teachers = resp.data.searchTeachers;
            this.setState({ "searchSuggestions": teachers });
        }).catch((err) => {
            console.error("SearchTeachers error:", err);
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
      placeholder: 'Teacher Name',
      value: this.state.searchValue,
      onChange: (event, { newValue }) => {
        var newVal = typeof newValue !== 'undefined' ? newValue : '';
        this.props.onChange(newVal);
        this.setState({
            searchValue: newVal
        });
      }
    };
     return (
        <div className={classes.search}>
          <Autosuggest
            suggestions={this.state.searchSuggestions}
            onSuggestionsFetchRequested={this.onSuggestionsFetchRequested}
            onSuggestionsClearRequested={this.onSuggestionsClearRequested}
            getSuggestionValue={(suggestion) => {return suggestion.name}}
            onSuggestionSelected={(event, args) => {
              event.stopPropagation();
              if (this.props.onTeacherSelected != null) {
                this.props.onTeacherSelected(args.suggestion);
              }
            }}
            renderSuggestion={(suggestion) => {
                return (<div>
                  <p style={{"color": "#000000"}}>{suggestion.name}</p>
                </div>)
            }}
            inputProps={inputProps}
            />
        </div>
    );
  }
}
TeacherSearcher.propTypes = {
  classes: PropTypes.object.isRequired,
};
export default withStyles(styles)(TeacherSearcher); 