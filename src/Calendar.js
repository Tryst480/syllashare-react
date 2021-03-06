import React, { Component } from 'react';
import { Modal, Button, Grid, withStyles, FormControl, InputLabel, Select, MenuItem, Paper, Typography, Grow, Collapse, Fade, CircularProgress } from '@material-ui/core';
import PropTypes from 'prop-types';
import BigCalendar from 'react-big-calendar-like-google';
import moment from 'moment';
import TextField from '@material-ui/core/TextField';
import DeleteIcon from '@material-ui/icons/Delete';
import uuidv4 from 'uuid/v4';
import Amplify, { API, graphqlOperation } from "aws-amplify";
import { AwsExports } from './cloud/CloudExports';
import * as queries from './graphql/queries';
import * as mutations from './graphql/mutations';
import * as subscriptions from './graphql/subscriptions';

Amplify.configure(AwsExports);
 
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
        textAlign: 'center',
        flexWrap: 'wrap',
    },
    paper: {
        padding: theme.spacing.unit * 2,
        textAlign: 'center',
        color: theme.palette.text.secondary,
    },
    modalPaper: {
        position: 'absolute',
        textAlign: 'center',
        width: theme.spacing.unit * 50,
        backgroundColor: theme.palette.background.paper,
        boxShadow: theme.shadows[5],
        padding: theme.spacing.unit * 4,
    },
    progress: {
        textAlign: 'center',
        margin: theme.spacing.unit * 2,
    },
    textField: {
        textAlign: 'center',
        marginLeft: theme.spacing.unit,
        marginRight: theme.spacing.unit,
        width: 200,
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

//Hsv to RGB converter (not mine)
function hsvToRgb(h, s, v) {
	var r, g, b;
	var i;
	var f, p, q, t;
 
	// Make sure our arguments stay in-range
	h = Math.max(0, Math.min(360, h));
	s = Math.max(0, Math.min(100, s));
	v = Math.max(0, Math.min(100, v));
 
	// We accept saturation and value arguments from 0 to 100 because that's
	// how Photoshop represents those values. Internally, however, the
	// saturation and value are calculated from a range of 0 to 1. We make
	// That conversion here.
	s /= 100;
	v /= 100;
 
	if(s == 0) {
		// Achromatic (grey)
		r = g = b = v;
		return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
	}
 
	h /= 60; // sector 0 to 5
	i = Math.floor(h);
	f = h - i; // factorial part of h
	p = v * (1 - s);
	q = v * (1 - s * f);
	t = v * (1 - s * (1 - f));
 
	switch(i) {
		case 0:
			r = v;
			g = t;
			b = p;
			break;
 
		case 1:
			r = q;
			g = v;
			b = p;
			break;
 
		case 2:
			r = p;
			g = v;
			b = t;
			break;
 
		case 3:
			r = p;
			g = q;
			b = v;
			break;
 
		case 4:
			r = t;
			g = p;
			b = v;
			break;
 
		default: // case 5:
			r = v;
			g = p;
			b = q;
	}
 
	return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}

//HSV to rgb converter (not mine)
function randomColors(total)
{
    var i = 360 / (total - 1); // distribute the colors evenly on the hue range
    var r = []; // hold the generated colors
    for (var x=0; x<total; x++)
    {
        r.push(hsvToRgb(i * x, 100, 100)); // you can also alternate the saturation and value for even more contrast between the colors
    }
    return r;
}

class Calendar extends Component {
    constructor(...args) {
        super(...args);
        this.state = {
            events: [],
            savedEvents: [],
            updatedEvents: [],
            deletedEventIDs: [],
            show: false,
            start: null,
            eventStartTime: "07:30",
            eventEndTime: "08:45",
            eventName: "",
            eventPriority: 0
        };
    }

    componentWillMount() {
        var params = {};
        var body = {};
        if (this.props.events != null) {
            this.setState({
                "events": this.props.events
            });
        }
        if (this.props.groupName != null) {
            this.getGroupEvents(this.props.groupName);
            this.subscribeToEventUpdates(this.props.groupName);
            this.subscribeToEventDeletion(this.props.groupName);
        }
    }

    componentWillReceiveProps(nextProps) {
        console.log("PROPS UPDATED", this.props.events);
        if (nextProps["events"] != null) {
            this.setState({
                "events": nextProps.events
            });
        }
    }

    subscribeToEventUpdates = (groupName) => {
        if (this.eventUpdateSubscription != null) {
            this.eventUpdateSubscription.unsubscribe();
            this.eventUpdateSubscription = null;
        }

        this.eventUpdateSubscription = API.graphql(graphqlOperation(subscriptions.subEventsUpdated, { "groupName": groupName })).subscribe({
            next: (data) => {
                console.log("EVT UPDATE SUBSCRIPTION: ", data);
                var events = data.value.data.subEventsUpdated["events"];
                var localEvents = this.state.events;
                console.log("Events: ", localEvents);
                var i = 0;
                while (i < events.length) {
                    var evt = events[i];
                    var found = false;
                    console.log("ITER EVENT");
                    var j = 0;
                    var startTime = new Date(parseInt(evt.time));
                    var endTime = new Date(parseInt(evt.time) + evt.mins * 60 * 1000);
                    while (j < localEvents.length) {
                        var existingEvt = localEvents[j];
                        if (existingEvt.globalID == evt.id) {
                            console.log("EVENT MATCHED");
                            existingEvt.title = evt.name;
                            existingEvt.start = startTime;
                            existingEvt.end = endTime;
                            existingEvt.priority = evt.priority;
                            found = true;
                            break;
                        }
                        j++;
                    }
                    if (!found) {
                        console.log("PUSHED");
                        localEvents.push({ "globalID": evt.id, "localID": uuidv4(), "title": evt.name, "start": startTime, "end": endTime, "priority": evt.priority })
                    }
                    i++;
                }
                console.log("NEW EVENTS: ", localEvents);
                this.setState({
                    "events": localEvents,
                    "savedEvents": localEvents
                })
            },
            error: (error) => {
                console.log("SUBInviteERR", JSON.stringify(error));
            }
        });
    }

    subscribeToEventDeletion = (groupName) => {
        if (this.eventDeleteSubscription != null) {
            this.eventDeleteSubscription.unsubscribe();
            this.eventDeleteSubscription = null;
        }

        this.eventDeleteSubscription = API.graphql(graphqlOperation(subscriptions.subEventsDeleted, { "groupName": groupName })).subscribe({
            next: (data) => {
                var deletedEvents = data.value.data.subEventsDeleted["events"];
                var newEvents = [];
                for (var localEvent of this.state.events) {
                    var found = false;
                    for (var deletedEvent of deletedEvents) {
                        if (deletedEvent.id == localEvent.globalID) {
                            found = true;
                            break;
                        }
                    }
                    if (!found){
                        newEvents.push(localEvent);
                    }
                }
                this.setState({
                    "events": newEvents,
                    "savedEvents": newEvents
                });
            },
            error: (error) => {
                console.log("SUBInviteERR", JSON.stringify(error));
            }
        });
    }

    getGroupEvents(groupName) {
        API.graphql(graphqlOperation(queries.getGroup, {
            "groupName": groupName
        })).then((resp) => {
            console.log("GetGroupEvents RESULT: ", resp);
            var events = resp.data.getGroup.group.events;
            var results = [];
            for (var evt of events) {
                var time = parseInt(evt.time);
                results.push({ "localID": uuidv4(), "globalID": evt.id, "title": evt.name, "start": new Date(time), "end": new Date(time + evt.mins * 60 * 1000), "priority": evt.priority })
            }
            this.setState({
                "events": results
            })
        })
        .catch((e) => {
            console.log("GetGroupEvents Error", e);
        });
        
    }

    hideModal = () => {
        this.setState({ 
            showEvent: false, 
            eventStartTime: "07:30",
            eventEndTime: "08:45",
            eventName: "",
            eventPriority: 0 });
    };

    deleteEvent = () => {
        var localID = this.state.eventLocalID;
        var updatedEvents = this.state.updatedEvents;
        var events = this.state.events;
        {
            var i = 0;
            for (var evt of updatedEvents) {
                if (evt.localID == localID) {
                    updatedEvents.splice(i, 1);
                    break;
                }
                i++;
            }
        }
        {
            var i = 0;
            for (var evt of events) {
                if (evt.localID == localID) {
                    events.splice(i, 1);
                    break;
                }
                i++;
            }
        }
        var deletedEventIDs = this.state.deletedEventIDs;
        if (this.state.eventGlobalID != null) {
            deletedEventIDs.push(this.state.eventGlobalID);
        }
        this.setState({
            "events": events,
            "updatedEvents": updatedEvents,
            "deletedEventIDs": deletedEventIDs,
            "showEvent": false,
            "eventName": ""
        })
    }

    handleSelectEmpty = ({ start, end }) => {
        if (!this.props.mutable) {
            return;
        }
        console.log("HANDLE EMPTY SELECT: ", start);
        this.setState({
            showEvent: true,
            start: start,
            eventGlobalID: null,
            eventLocalID: null
        });
    }

    handleSelectEvent = (event) => {
        if (!this.props.mutable) {
            return;
        }
        console.log("HANDLE SELECT: ", event);
        if(event.title != null) {
            console.log("SETTING TO EXISTING");
            var start = new Date(moment(event.start.getTime()).startOf('day').valueOf());
            var startTime = "";
            var toTimeFormat = (date) => {
                var hours = date.getHours().toString();
                while (hours.length < 2) {
                    hours = "0" + hours;
                }
                var minutes = date.getMinutes().toString();
                while(minutes.length < 2) {
                    minutes = "0" + minutes;
                }
                return hours + ":" + minutes;
            }
            var startTime = toTimeFormat(event.start);
            console.log("START TIME: ", startTime);
            this.setState({
                showEvent: true,
                eventName: event.title,
                start: start,
                eventStartTime: startTime,
                eventEndTime: toTimeFormat(event.end),
                eventLocalID: event.localID,
                eventGlobalID: event.globalID,
                eventPriority: event.priority
            })
        }else {
            this.handleSelectEmpty
        }
    }

    handleChange = name => event => {
        this.setState({
            [name]: event.target.value,
        });
    }

    ColourValue = () => {
        "GREEN";
    }

    eventStyleGetter = (event, start, end, isSelected) => {
        var backgroundColor = "DarkCyan";
        if (event.priority == 1) {
            backgroundColor = "orangered";
        } else if (event.priority == 2) {
            backgroundColor = "darkred";
        }
        var style = {
            backgroundColor: backgroundColor
        };
        return {
            style: style
        };
    }
    
    onSave = () => {
        var deleteLocalEvents = (events) => {
            var localIDMap = {};
            for (var updatedEvent of events) {
                localIDMap[updatedEvent.localID] = true;
            }
            console.log("LOCALID MAP: ", localIDMap);
            var localEvents = this.state.events;
            var newEvents = [];
            var i = 0;
            while (i < localEvents.length) {
                if (localIDMap[localEvents[i].localID] == null) {
                    newEvents.push(localEvents[i]);
                }
                i++;
            }
            this.setState({
                "events": newEvents,
                "updatedEvents": []
            });
        }

        var updateEvents = (groupName, events) => {
            API.graphql(graphqlOperation(mutations.updateEvents, {
                "groupName": groupName,
                "events": events
            })).then((resp) => {
                console.log("Events saved!");
                deleteLocalEvents(this.state.updatedEvents);
                if (this.props.onSaveComplete != null) {
                    this.props.onSaveComplete(groupName);
                }
            })
            .catch((e) => {
                console.log("UpdateEvents Error", e);
            });
        };

        var deleteEventIDs = (groupName, eventIDs) => {
            API.graphql(graphqlOperation(mutations.deleteEvents, {
                "groupName": groupName,
                "eventIDs": eventIDs
            })).then((resp) => {
                console.log("Events deleted!");
                this.setState({
                    "deletedEventIDs": []
                })
            })
            .catch((e) => {
                console.log("DeleteEvents Error", e);
            });
        }

        if (this.props.onSave != null) {
            this.props.onSave(this.state.events, (groupName, events) => {
                updateEvents(groupName, events);
            });
        } else {
            var events = [];
            for (var evt of this.state.updatedEvents) {
                events.push({"name": evt.name, "time": evt.time, "mins": evt.mins, "priority": evt.priority, "id": evt.globalID });
            }
            if (events.length > 0) {
                updateEvents(this.props.groupName, events);
            }
            if (this.state.deletedEventIDs.length > 0) {
                deleteEventIDs(this.props.groupName, this.state.deletedEventIDs);
            }
        }
    }

    onEventUpdate() {
        var dayStartMillis = 0;
        {
            var colonIdx = this.state.eventStartTime.indexOf(':');
            var hours = this.state.eventStartTime.substr(0, colonIdx);
            var mins = this.state.eventStartTime.substr(colonIdx + 1);
            console.log("HOURS:", hours, "MINS: ", mins);
            dayStartMillis = (parseInt(hours) * 60 + parseInt(mins)) * 60 * 1000;
        }

        var dayEndMillis = 0;
        {
            var colonIdx = this.state.eventEndTime.indexOf(':');
            var hours = this.state.eventEndTime.substr(0, colonIdx);
            var mins = this.state.eventEndTime.substr(colonIdx + 1);
            dayEndMillis = (parseInt(hours) * 60 + parseInt(mins)) * 60 * 1000;
        }
        if (dayEndMillis < dayStartMillis) {
            console.log("Invalid end time");
            return;
        }
        console.log("START", this.state.start.getTime());
        var time = this.state.start.getTime() + dayStartMillis;
        console.log("TIME: ", time);
        var duration = dayEndMillis - dayStartMillis
        var mins = duration / (60 * 1000);

        var localID = this.state.eventLocalID;
        var updatedEvents = this.state.updatedEvents;
        var events = this.state.events;
        var updatedEventFound = false;
        var eventFound = false;
        for (var evt of updatedEvents) {
            if (evt.localID == localID) {
                evt.name = this.state.eventName;
                evt.time = time;
                evt.mins = mins;
                evt.priority = this.state.eventPriority;
                updatedEventFound = true;
                break;
            }
        }
        for (var evt of events) {
            if (evt.localID == localID) {
                evt.title = this.state.eventName;
                evt.start = new Date(time);
                evt.end = new Date(time + duration);
                evt.priority = this.state.eventPriority;
                eventFound = true;
                break;
            }
        }
        if (localID == null) {
            localID = uuidv4();
        }
        if (!updatedEventFound) {
            updatedEvents.push({ "name": this.state.eventName, "time": time, "mins": mins, "priority": this.state.eventPriority, "globalID": this.state.eventGlobalID, "localID": localID });
        }
        if (!eventFound) {
            events.push({ "localID": localID, "title": this.state.eventName, "start": new Date(time), "end": new Date(time + duration), "priority": this.state.eventPriority, "globalID": this.state.eventGlobalID });
        }
        this.setState({
            "events": events,
            "updatedEvents": updatedEvents,
            "eventName": "",
            "showEvent": false
        });
    }

    renderModal() {
        const { classes } = this.props;
        return (
            <div>
            <Modal
                aria-labelledby="simple-modal-title"
                aria-describedby="simple-modal-description"
                open={this.state.showEvent}
                onClose={() => {this.hideModal()}}>
                <div style={getModalStyle()} className={classes.modalPaper}>
                    <Grid item xs={12}>
                        <TextField
                            id="standard-textarea"
                            label="Event Name"
                            placeholder="Midterm 2"
                            multiline
                            className={classes.textField}
                            margin="normal"
                            value={this.state.eventName}
                            onChange={(e) => {
                                this.setState({
                                    "eventName": e.target.value
                                });
                            }}
                            />
                        <Grid item xs={12}>
                            <TextField
                                id="time"
                                label="Event Start Time"
                                type="time"
                                className={classes.textField}
                                InputLabelProps={{
                                    shrink: true,
                                }}
                                inputProps={{
                                    step: 300, // 5 min
                                }}
                                value={this.state.eventStartTime}
                                onChange={(e) => {
                                    this.setState({
                                        "eventStartTime": e.target.value
                                    });
                                }}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                id="time"
                                label="Event End Time"
                                type="time"
                                value={this.state.eventEndTime}
                                className={classes.textField}
                                InputLabelProps={{
                                    shrink: true,
                                }}
                                inputProps={{
                                    step: 300, // 5 min
                                }}
                                onChange={(e) => {
                                    this.setState({
                                        "eventEndTime": e.target.value
                                    });
                                }}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <FormControl className={classes.formControl}>
                                <InputLabel htmlFor="age-simple">Priority</InputLabel>
                                <Select
                                    style={{background: "#FFFFFF"}}
                                    value={(this.state.eventPriority != null)? this.state.eventPriority: "Select A Priority"}
                                    onChange={(event) => {
                                        this.setState({
                                            eventPriority: event.target.value
                                        });
                                    }}
                                    inputProps={{
                                        name: 'school',
                                        id: 'school-simple',
                                    }}>
                                        <MenuItem value={0}>Low</MenuItem>
                                        <MenuItem value={1}>Medium</MenuItem>
                                        <MenuItem value={2}>High</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                    </Grid>
                    <br />
                    <Grid container justify="center" spacing={(this.state.eventLocalID == null)? 0: 16} xs={12}>
                    <Grid key={"updateEventButton"} item >
                    <Button variant="contained" color="primary" 
                        disabled={!(this.state.eventStartTime.length > 0 && this.state.eventEndTime.length > 0 && this.state.eventName.length > 0)} 
                        onClick={this.onEventUpdate.bind(this)}>{(this.state.eventLocalID != null)? "Update": "Create"}</Button>
                    </Grid>
                    {(this.state.eventLocalID != null)?(
                        <Grid key={"deleteEventButton"} item>
                        <Button variant="contained" color="secondary" 
                            onClick={this.deleteEvent.bind(this)} >
                                Delete
                            </Button>
                        </Grid>): null}
                    </Grid>
                </div>
            </Modal>
            </div>
        );
    }


    render() {
        const { classes } = this.props;
        return (
            <div style={{
                paddingBottom: 50
            }}>
                {this.renderModal()}
                <div style={{
                    marginBottom: 100
                }}>
                    <BigCalendar
                    selectable
                    style={{ height: '700px' }}
                    events={this.state.events}
                    step={60}//in minuets
                    defaultDate={(this.props.startTime != null)? new Date(this.props.startTime): new Date()}
                    popup={true}
                    popupOffset={30}
                    onSelectEvent={this.handleSelectEvent.bind(this)}
                    onSelectSlot={this.handleSelectEmpty.bind(this)}
                    eventPropGetter={this.eventStyleGetter.bind(this)} />
                </div>
            <div style={{"textAlign": "center"}}>
                {
                    ((this.props.canSave == null && (this.state.updatedEvents.length > 0 || this.state.deletedEventIDs.length > 0)) || this.props.canSave)?
                        <Button onClick={this.onSave.bind(this)} variant="contained" color="primary" className={classes.button}>Save</Button>: <div/>
                }
            </div>
        </div>);
    }
};

Calendar.propTypes = {
    classes: PropTypes.object.isRequired
};

export default withStyles(styles)(Calendar);