import React, { Component } from 'react';
import { Modal, Button, Grid, withStyles, Paper, Typography, Grow, Collapse, Fade, CircularProgress } from '@material-ui/core';
import PropTypes from 'prop-types';
import BigCalendar from 'react-big-calendar-like-google';
import moment from 'moment';
import Events from './Events';
import TextField from '@material-ui/core/TextField';
 
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


class Calendar extends Component {
    constructor(...args) {
        super(...args);
        this.state = {
            Events,
            show: false,
        };
    }

    componentWillMount() {
        var params = {};
        var body = {};
        
    }

    //modal
    // showModal = () => {
    //     this.setState({ showNew: true });
    // };

    hideModal = () => {
        this.setState({ showNew: false }),
        this.setState({ showEvent: false });
    };

    handleSelectEmpty = ({ start, end }) => {

        this.setState({
                showNew: true
            })
    }

    handleSelectEvent = (title) => {
        console.log("hello" + this.title)
        if(title == Events)
            this.setState({
                showEvent: true,
            })
        else
            this.handleSelectEmpty
    }

    handleChange = name => event => {
        this.setState({
            [name]: event.target.value,
        });
    }

    ColourValue = () => {
        "GREEN";
    }

    renderModal(){
        const { classes } = this.props;
        return (
            <div>
            <Modal
                aria-labelledby="simple-modal-title"
                aria-describedby="simple-modal-description"
                open={this.state.showNew}
                onClose={() => {this.hideModal()}}>
                <div style={getModalStyle()} className={classes.modalPaper}>
                    <Grid item xs={12}>
                        <TextField
                            id="standard-textarea"
                            label="Create a new Event."
                            placeholder="Enter Name here"
                            multiline
                            className={classes.textField}
                            margin="normal"
                            />
                        <Grid item xs={12} sm={6}>
                            <form className={classes.container} noValidate >
                                <TextField
                                    id="time"
                                    label="Event Time"
                                    type="time"
                                    defaultValue="07:30"
                                    className={classes.textField}
                                    InputLabelProps={{
                                        shrink: true,
                                    }}
                                    inputProps={{
                                        step: 300, // 5 min
                                    }}
                                />
                            </form>
                        </Grid>
                            <Grid  item xs={12} sm={6}>
                                <body><br/>
                                <form action = "/action_page.php">
                                    Select a colour :
                                    <input type="color" name="favcolor" value={this.ColourValue()}/>
                                </form>
                            </body>
                        </Grid>
                        <Grid>
                            <form className={classes.container} noValidate>
                                <TextField
                                    id="filled-multiline-flexible"
                                    label="Notes."
                                    multiline
                                    rowsMax="4"
                                    value={this.state.multiline}
                                    onChange={this.handleChange('multiline')}
                                    className={classes.textField}
                                    margin="normal"
                                    variant="filled"
                                />
                            </form>
                        </Grid>
                </Grid>
                </div>
            </Modal>
            </div>
        );
    }


    render() {
        const { classes } = this.props;
        return (
            <div>
            {this.renderModal()}

                <BigCalendar
                selectable
                style={{ height: '700px' }}
                events={Events}
                step={60}//in minuets
                defaultDate={new Date(2015, 3, 1)}
                popup={true}
                popupOffset={30}
                onSelectEvent={this.handleSelectEvent(this.title)}
                onSelectSlot={this.handleSelectEmpty}
            />
        </div>);
    }
};

Calendar.propTypes = {
    classes: PropTypes.object.isRequired
};

export default withStyles(styles)(Calendar);