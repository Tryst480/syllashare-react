import React, { Component } from 'react';
import { Button, TextField, Select, Grid, MenuItem, FormControl, InputLabel, Switch, Chip, Avatar, Table, TableRow, TableCell, withStyles, FormControlLabel, TableHead, TableBody, Paper, Typography, Grow, Collapse, Fade, CircularProgress } from '@material-ui/core';
import ToggleButtonGroup from '@material-ui/lab/ToggleButtonGroup';
import ToggleButton from '@material-ui/lab/ToggleButton';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import update from 'react-addons-update';
import BackendExports from './BackendExports';
import Amplify, { Storage, Auth, Hub, API, graphqlOperation } from 'aws-amplify';
import EditIcon from '@material-ui/icons/Edit';
import { AwsExports } from './cloud/CloudExports';
import TeacherSearcher from './TeacherSearcher';
import * as queries from './graphql/queries';
import * as mutations from './graphql/mutations';
import * as subscriptions from './graphql/subscriptions';
import { strict } from 'assert';
import Dropzone from 'react-dropzone';
import Calendar from './Calendar';
import uuidv4 from 'uuid/v4';

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
    progress: {
        margin: theme.spacing.unit * 2,
    },
    textField: {
        marginLeft: theme.spacing.unit,
        marginRight: theme.spacing.unit,
        width: 300
    },
    bigFont: {
        fontSize: 'x-large'
    },
    topRightCorner: {
        position: "absolute",
        top: 0,
        right: 0,
        margin: "5px"
    }
});

class ClassCreator extends Component {
    constructor(props) {
        super();
        this.state = {
            "courseID": "",
            "courseName": "",
            "school": null,
            "schools": [],
            "terms": ["Fall", "Spring", "Summer"],
            "year": (new Date()).getFullYear().toString(),
            "weekdays": ["SU", "MO", "TU", "WE", "TH", "FR", "SA"],
            "selectedWeekDays": [],
            "startTime": "07:30",
            "endTime": "08:45",
            "termStart": null,
            "termEnd": null,
            "classEvents": []
        }
    }

    componentWillMount() {
        var syllaToken = this.props["syllaToken"];
        fetch(BackendExports.Url + '/api/getschools', 
        {
            method: 'GET',
            headers: new Headers({
                "authorization": syllaToken
            }),
            credentials: 'include'
        })
        .then((response) => {
            return response.json();
        })
        .then((response) => {
            console.log("Schools:", response);
            this.setState({
                "schools": response
            });
        }).catch((err) => {
            console.error("GetSchools Ex: ", err);
        });
    }

    getTerm() {
        console.log("GETTING TERM!");
        API.graphql(graphqlOperation(queries.getTerm, { "schoolName": this.state.school.name, "term": this.state.term, "year": this.state.year })).then((resp) => {
            console.log("TERM DATA: ", resp);
            var toTime = (str) => {
                var slashIdx = str.indexOf('/');
                var month = parseInt(str.substr(0, slashIdx));
                var day = parseInt(str.substr(slashIdx + 1));
                return new Date(parseInt(this.state.year), month - 1, day).getTime();
            }
            this.setState({
                "termStart": toTime(resp.data.getTerm.start),
                "termEnd": toTime(resp.data.getTerm.end)
            });
        }).catch((err) => {
            console.error("GetTerm error:", err);
        });
    }

    setClassEvents() {
        console.log("Setting class events");
        var toTime = (str) => {
            var colonIdx = str.indexOf(":");
            var hour = parseInt(str.substr(0, colonIdx));
            var minute = parseInt(str.substr(colonIdx + 1));
            return (hour * 60 + minute) * 60 * 1000;
        };
        var time = this.state.termStart + toTime(this.state.startTime);
        var duration = toTime(this.state.endTime) - toTime(this.state.startTime);
        var dayNums = [false, false, false, false, false, false, false];
        for (var day of this.state.selectedWeekDays) {
            dayNums[this.state.weekdays.indexOf(day)] = true;
        }
        console.log("DAYNUMS: ", dayNums);
        var classEvents = [];
        while (time < this.state.termEnd) {
            var date = new Date(time);
            var scanEventFound = false;
            var day = date.getDay();
            if (dayNums[day]) {
                if (this.state.scanEvents != null) {
                    var monthStr = (date.getMonth() + 1).toString();
                    monthStr = (monthStr.length == 1)? "0" + monthStr: monthStr;
                    var dStr = date.getDate().toString();
                    dStr = (dStr.length == 1)? "0" + dStr: dStr;
                    var dateStr = monthStr + '/' + dStr + '/' + date.getFullYear();
                    console.log("DATESTR:", dateStr);
                    for (var scanEvent of this.state.scanEvents) {
                        if (scanEvent.date == dateStr) {
                            classEvents.push({
                                "title": scanEvent.event_title,
                                "localID": uuidv4(),
                                "start": date,
                                "end": new Date(time + duration),
                                "priority": 0
                            });
                            scanEventFound = true;
                            break;
                        }
                    }
                }
                if (!scanEventFound) {
                    classEvents.push({
                        "title": "Class",
                        "localID": uuidv4(),
                        "start": date,
                        "end": new Date(time + duration),
                        "priority": 0
                    });
                }
            }
            time += 24 * 60 * 60 * 1000;
        }
        console.log("Class Events: ", classEvents);
        this.setState({
            "classEvents": classEvents
        });
    }

    onSave(events, cb) {
        var results = [];
        for (var evt of events) {
            console.log("EVENT NAME: ", evt.title);
            results.push({
                "name": evt.title, 
                "time": evt.start.getTime(), 
                "mins": ((evt.end.getTime() - evt.start.getTime()) / (60 * 1000)), 
                "priority": evt.priority});
        }
        var timeStr = "";
        for (var t of this.state.selectedWeekDays) {
            timeStr += t + " ";
        }
        timeStr += this.state.startTime + "-" + this.state.endTime;
        console.log("Teacher name")
        API.graphql(graphqlOperation(mutations.createClass, { 
            "courseID": (this.props.courseID != null)? this.props.courseID: this.state.courseID, 
            "schoolName": (this.props.schoolName != null)? this.props.schoolName: this.state.school.name, 
            "term": this.state.term,
            "year": parseInt(this.state.year),
            "courseName": this.state.courseName,
            "teacherName": this.state.teacherName,
            "timeStr": timeStr
        })).then((resp) => {
            console.log("Create Class Resp: ", resp);
            cb(resp.data.createClass.id, results);
        })
        .catch((e) => {
            console.log("CreateClass Error", e);
        });
    }

    onDrop(acceptedFiles) {
        var pdfID = uuidv4();
        if (acceptedFiles.length == 0) {
            return;
        }
        console.log("ACCEPTED FILE: ", acceptedFiles);
        Storage.put(pdfID, acceptedFiles[0], { level: 'public' })
            .then(picResult => { 
                var objKey = 'public/' + pdfID;
                fetch(BackendExports.Url + '/api/classscan', 
                {
                    method: 'POST',
                    headers: new Headers({
                        "authorization": this.props.syllaToken
                    }),
                    credentials: 'include',
                    body: JSON.stringify({
                        'objKey': objKey
                    })
                })
                .then((response) => {
                    return response.json();
                })
                .then((response) => {
                    console.log("ScanResult:", response);
                    this.setState({
                        "courseID": response.class_number,
                        "courseName": response.class_title,
                        "scanEvents": response.events
                    })
                })
            })
            .catch(err => { 
                console.error("GET PIC ERR: " + err);
            });
    }

    render() {
        const { classes } = this.props;
        return (<div>
            {
                (this.props.courseID == null)? (
                    <div style={{"textAlign": "center"}}>
                        <Typography variant="h3" gutterBottom>
                            Create Class
                        </Typography>
                        { (this.state.scanEvents == null)? (
                            <Dropzone
                                style={{"width" : "100%", "height" : "200px", "border" : "1px solid black", "textAlign": "center"}}
                                onDrop={this.onDrop.bind(this)}>
                                <p>Drag and Drop Syllabus<br/> (or click to manually select)</p>
                            </Dropzone>): <div />
                        }
                        <Grid
                            container
                            spacing={0}
                            direction="column"
                            alignItems="center"
                            justify="center">
                            <Grid item xs={10}>
                                <Paper classes={classes.paper}>
                                    <Typography variant="h4" gutterBottom>
                                        Course
                                    </Typography>
                                    <TextField InputLabelProps={{ shrink: true }}
                                        label="Course Number"
                                        placeholder="CS3000"
                                        className={classes.textField}
                                        value={this.state.courseID}
                                        onChange={(evt) => {this.setState({ courseID: evt.target.value })}}
                                        InputProps={{
                                            classes: {
                                                input: classes.bigFont,
                                            },
                                        }}
                                        margin="normal"/>
                                    <TextField InputLabelProps={{ shrink: true }}
                                        label="Course Name"
                                        placeholder="Software Engineering"
                                        className={classes.textField}
                                        value={this.state.courseName}
                                        onChange={(evt) => {this.setState({ courseName: evt.target.value })}}
                                        InputProps={{
                                            classes: {
                                                input: classes.bigFont,
                                            },
                                        }}
                                        margin="normal"/>
                                    <br />
                                    <FormControl className={classes.formControl}>
                                        <InputLabel htmlFor="age-simple">School</InputLabel>
                                        <Select
                                            style={{background: "#FFFFFF"}}
                                            value={(this.state.school != null)? this.state.school.name: "Select A School"}
                                            onChange={(event) => {
                                                var schoolName = event.target.value;
                                                for (var school of this.state.schools) {
                                                    if (school.name == schoolName) {
                                                        this.setState({
                                                            school: school
                                                        }, () => {
                                                            if (this.state.year.length >= 4 && this.state.term != null) {
                                                                this.getTerm();
                                                            }
                                                        });
                                                        return;
                                                    }
                                                }
                                                this.setState({
                                                    school: null
                                                });
                                            }}
                                            inputProps={{
                                                name: 'school',
                                                id: 'school-simple',
                                            }}>
                                            {this.state.schools.map((school) => {
                                                return <MenuItem value={school.name}>{school.name}</MenuItem>
                                            })}
                                        </Select>
                                    </FormControl>
                                </Paper>
                            </Grid>   
                        </Grid>
                        <hr />
                        <Grid
                            container
                            spacing={0}
                            direction="column"
                            alignItems="center"
                            justify="center">
                            <Grid item xs={12}>
                                <Paper classes={classes.paper}>
                                    <Typography variant="h4" gutterBottom>
                                        Class
                                    </Typography>
                                    <FormControl className={classes.formControl}>
                                        <InputLabel htmlFor="term-simple">Term</InputLabel>
                                        <Select
                                            style={{background: "#FFFFFF"}}
                                            value={(this.state.term != null)? this.state.term: "Select a Term"}
                                            onChange={(event) => {
                                                this.setState({
                                                    "term": event.target.value
                                                }, () => {
                                                    if (this.state.year.length >= 4 && this.state.school != null) {
                                                        this.getTerm();
                                                    }
                                                });
                                            }}
                                            inputProps={{
                                                name: 'school',
                                                id: 'school-simple',
                                            }}>
                                            {this.state.terms.map((term) => {
                                                return <MenuItem value={term}>{term}</MenuItem>
                                            })}
                                        </Select>
                                    </FormControl>
                                    <br />
                                    <TextField
                                        id="standard-year"
                                        label="Year"
                                        value={this.state.year}
                                        onChange={(e) => {
                                            this.setState({
                                                "year": e.target.value
                                            }, () => {
                                                if (e.target.value.length >= 4 && this.state.school != null && this.state.term != null) {
                                                    this.getTerm();
                                                }
                                            });
                                        }}
                                        type="number"
                                        className={classes.textField}
                                        InputLabelProps={{
                                            shrink: true,
                                        }}
                                        margin="normal"
                                        />
                                    <br />
                                    <TeacherSearcher onChange={(val) => {this.setState({"teacherName": val})}} />
                                    <br />
                                    <div className={classes.toggleContainer}>
                                        <ToggleButtonGroup value={this.state.selectedWeekDays} onChange={(event, alignment) => { 
                                            if (alignment == null) {
                                                alignment = [];
                                            }
                                            this.setState({ "selectedWeekDays": alignment }, () => {
                                                if (this.state.selectedWeekDays.length > 0 && this.state.startTime.length > 0 && this.state.endTime.length > 0) {
                                                    this.setClassEvents();
                                                }
                                            });
                                            console.log(alignment);
                                        }}>
                                            {
                                                this.state.weekdays.map((weekday) => {
                                                    return (<ToggleButton value={weekday}>{weekday}</ToggleButton>)
                                                })
                                            }
                                        </ToggleButtonGroup>
                                    </div>
                                    <Grid container className={classes.demo} justify="center" xs={12}>
                                        <Grid key={"0"} item className={classes.root} >
                                            <TextField
                                                id="time"
                                                label="Class Start Time"
                                                type="time"
                                                value={this.state.startTime}
                                                className={classes.textField}
                                                InputLabelProps={{
                                                    shrink: true
                                                }}
                                                inputProps={{
                                                    step: 300,
                                                }}
                                                onChange={(e) => {
                                                    this.setState({
                                                        "startTime": e.target.value
                                                    });
                                                }} />
                                        </Grid>
                                        <Grid key={"1"} item className={classes.root} >
                                            <TextField
                                                id="time"
                                                label="Class End Time"
                                                type="time"
                                                defaultValue="08:45"
                                                className={classes.textField}
                                                InputLabelProps={{
                                                    shrink: true,
                                                    float: "left"
                                                }}
                                                inputProps={{
                                                    step: 300,
                                                }}
                                                value={this.state.endTime}
                                                onChange={(e) => {
                                                    this.setState({
                                                        "endTime": e.target.value
                                                    });
                                                }} />
                                        </Grid>
                                    </Grid>
                                </Paper>
                            </Grid>
                        </Grid>
                        {
                            (this.state.termStart != null)? <Calendar canSave={(this.props.courseID != null || 
                                (this.state.courseID.length > 0 && this.state.courseName.length > 0 && this.state.school != null)) 
                                && this.state.selectedWeekDays.length > 0 && this.state.startTime.length > 0 && this.state.endTime.length > 0 } 
                                mutable={true} startTime={this.state.termStart} 
                                events={this.state.classEvents} 
                                onSave={this.onSave.bind(this)}
                                onSaveComplete={(classID) => {this.props.onClassSelected(classID)}} />: <div />
                        }
                    </div>): <div />
            }

        </div>);
    }
};

ClassCreator.propTypes = {
    classes: PropTypes.object.isRequired
};

export default withStyles(styles)(ClassCreator);