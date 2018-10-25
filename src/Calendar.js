import React, { Component } from 'react';
import { Button, Grid, withStyles, Paper, Typography, Grow, Collapse, Fade, CircularProgress } from '@material-ui/core';
import PropTypes from 'prop-types';
import BigCalendar from 'react-big-calendar-like-google';
import moment from 'moment';
 
BigCalendar.setLocalizer(
  BigCalendar.momentLocalizer(moment)
);

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

class Calendar extends Component {
    constructor(props) {
        super();
        this.state = {
            
        };
    }

    componentWillMount() {
        var params = {};
        var body = {};
        
    }

    render() {
        return (<div>
            <BigCalendar style={{ height: '700px' }}
                events={[]}
                step={60}
                defaultDate={new Date(2015, 3, 1)}
            />
        </div>);
    }
};

Calendar.propTypes = {
    classes: PropTypes.object.isRequired
};

export default withStyles(styles)(Calendar);