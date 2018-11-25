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
            "year": (new Date()).getFullYear(),
            "weekdays": ["SU", "MO", "TU", "WE", "TH", "FR", "SA"],
            "selectedWeekDays": []
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

    render() {
        const { classes } = this.props;
        return (<div>
            {
                (this.props.courseID == null)? (
                    <div style={{"textAlign": "center"}}>
                        <Typography variant="h3" gutterBottom>
                            Create Class
                        </Typography>
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
                                    <TeacherSearcher />
                                    <br />
                                    <div className={classes.toggleContainer}>
                                        <ToggleButtonGroup value={this.state.selectedWeekDays} onChange={(event, alignment) => this.setState({ "selectedWeekDays": alignment })}>
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
                                                defaultValue="07:30"
                                                className={classes.textField}
                                                InputLabelProps={{
                                                    shrink: true
                                                }}
                                                inputProps={{
                                                    step: 300,
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
                                            }} />
                                        </Grid>
                                    </Grid>
                                </Paper>
                            </Grid>   
                        </Grid>
                    </div>): <div />
            }

        </div>);
    }
};

ClassCreator.propTypes = {
    classes: PropTypes.object.isRequired
};

export default withStyles(styles)(ClassCreator);