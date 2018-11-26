import React from 'react';
import PropTypes from 'prop-types';
import Autosuggest from 'react-autosuggest';
import { fade } from '@material-ui/core/styles/colorManipulator';
import { TextField, withStyles, Switch, Avatar, Modal, Button } from '@material-ui/core';
import BackendExports from './BackendExports';
import classNames from 'classnames';
import Amplify, { Storage, Auth, Hub, API, graphqlOperation } from 'aws-amplify';
import { AwsExports, GcpExports } from './cloud/CloudExports';
import * as queries from './graphql/queries';
import * as mutations from './graphql/mutations';
import * as subscriptions from './graphql/subscriptions';
import update from 'react-addons-update';
import CourseClasses from './CourseClasses';

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
  },
  modalPaper: {
    position: 'absolute',
    width: theme.spacing.unit * 100,
    backgroundColor: theme.palette.background.paper,
    boxShadow: theme.shadows[5],
    padding: theme.spacing.unit * 4,
    },
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

class ClassSearcher extends React.Component {
  state = {
    searchValue: '',
    searchSuggestions: []
  };
   // Autosuggest will call this function every time you need to update suggestions.
  // You already implemented this logic above, so just use it.
  onSuggestionsFetchRequested = ({ value }) => {
    if (value.length > 0) {
        API.graphql(graphqlOperation(queries.searchCourses, { "query": value })).then((resp) => {
            var courses = resp.data.searchCourses;
            this.setState({ "searchSuggestions": courses });
        }).catch((err) => {
            console.error("GetGroup error:", err);
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
      placeholder: 'Search Courses',
      value: this.state.searchValue,
      onChange: (event, { newValue }) => {
        this.setState({
            searchValue: typeof newValue !== 'undefined' ? newValue : '',
        });
      }
    };
     return (
        <div className={classes.search}>
            <Modal
            aria-labelledby="simple-modal-title"
            aria-describedby="simple-modal-description"
            open={this.state.courseID != null}
            onClose={() => {this.setState({
                courseID: null
            })}}>
                <div style={getModalStyle()} className={classes.modalPaper}>
                    <CourseClasses courseID={this.state.courseID} onClassSelected={(classID) => { 
                        this.props.onClassSelected(classID); 
                        this.setState({
                            "courseID": null,
                            "searchValue": ""
                        }) 
                    }} />
                </div>
            </Modal>
            <Autosuggest
                suggestions={this.state.searchSuggestions}
                onSuggestionsFetchRequested={this.onSuggestionsFetchRequested}
                onSuggestionsClearRequested={this.onSuggestionsClearRequested}
                getSuggestionValue={(suggestion) => {return suggestion.id}}
                onSuggestionSelected={(event, args) => {
                    event.stopPropagation();
                    this.setState({
                        courseID: args.suggestion.id
                    });
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
ClassSearcher.propTypes = {
  classes: PropTypes.object.isRequired,
};
export default withStyles(styles)(ClassSearcher); 