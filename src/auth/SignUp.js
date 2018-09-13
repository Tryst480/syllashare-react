import React, { Component } from 'react';
import { Button, Grid, withStyles, Fade, Paper, Typography, TextField, FormGroup, FormControlLabel, Switch, LinearProgress, Snackbar, IconButton } from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';
import PropTypes from 'prop-types';
import Amplify from '@aws-amplify/core';
import { Auth } from 'aws-amplify';
import AwsExports from '../aws/AwsExports';

// in this way you are only importing Auth and configuring it.
Amplify.configure(AwsExports);

const styles = theme => ({
    root: {
        flexGrow: 1,
    },
    container: {
        display: 'flex',
    },
    paper: {
        padding: theme.spacing.unit * 2,
        textAlign: 'center',
        color: theme.palette.text.secondary
    },
    textField: {
        width: 400
    },
    nameField: {
        autoFocus: true
    },
    progressDiv: {
        height: 50
    },
    close: {
        width: theme.spacing.unit * 4,
        height: theme.spacing.unit * 4,
    }
});

class SignUp extends Component {
    constructor(props) {
        super(props);
        this.state = {
            name: "",
            password: "",
            verifier: "",
            mfa: false,
            remember: false,
            loading: false,
            errorMsg: null
        };
    }

    componentWillMount() {
        //init code
    }

    onSignUp() {
        this.setState({loading: true, errorMsg: null});
        var attributes = {};
        if (this.state.verifier.includes('@')) {
            attributes.email = this.state.verifier;
        } else {
            attributes.phone = this.state.verifier;
        }
        Auth.signUp({
            username: this.state.name,
            password: this.state.password,
            attributes: attributes
        })
        .then((result) => {
            console.log("SignUp: ", result);
            if (result.userConfirmed) {
                this.props.onSignIn();
            } else {
                this.props.onCode({ "mode": "SIGNUP", "username": result.user.username, "password": this.state.password, "method": (attributes.email ? "EMAIL" : "SMS") });
            }
            this.setState({loading: false});
        })
        .catch((err) => { 
            console.error("SignUpErr: ", err);
            this.setState({loading: false, errorMsg: err.message});
        });
    }

    onSnackClose() {
        this.setState({ errorMsg: null });
    }

    render() {
        const { classes } = this.props;
        return (
            <div className={classes.root}>
                <Snackbar 
                    anchorOrigin={{vertical: 'bottom', horizontal: 'left'}} 
                    open={(this.state.errorMsg != null)} 
                    autoHideDuration={6000}
                    ContentProps={{
                        'aria-describedby': 'message-id',
                    }}
                    onClose={this.onSnackClose.bind(this)}
                    message={<span id='message-id'>{this.state.errorMsg}</span>}
                    action={[
                        <IconButton
                            key="close"
                            aria-label="Close"
                            color="inherit"
                            className={classes.close}
                            onClick={this.onSnackClose.bind(this)}
                        >
                            <CloseIcon />
                        </IconButton>,
                    ]}
                     />
                <Fade in={this.state.loading}>
                    <LinearProgress />
                </Fade>
                <Grid container direction="column" alignItems="center" spacing={2}>
                    <Grid item xs={8} sm={8}>
                        <TextField
                            id="name"
                            label="Name"
                            className={`${classes.textField} ${classes.nameField}`}
                            value={this.state.name}
                            disabled={this.state.loading} 
                            onChange={(evt) => { this.setState({name: evt.target.value}); }}
                            margin="normal"
                        />
                    </Grid>
                    <Grid item xs={8} sm={8}>
                        <TextField
                            id="verifier"
                            label="Email"
                            className={classes.textField}
                            value={this.state.verifier}
                            disabled={this.state.loading} 
                            onChange={(evt) => { this.setState({verifier: evt.target.value}); }}
                            margin="normal"
                        />
                    </Grid>
                    <Grid item xs={8} sm={8}>
                        <TextField
                            id="password"
                            label="Password"
                            type="password"
                            className={classes.textField}
                            value={this.state.password}
                            disabled={this.state.loading} 
                            onChange={(evt) => { this.setState({password: evt.target.value}); }}
                            margin="normal"
                        />
                    </Grid>
                    <Grid item xs={8} sm={8}>
                    <FormGroup row>
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={this.state.mfa}
                                    disabled={this.state.loading} 
                                    onChange={(evt) => { this.setState({ mfa: evt.target.checked }); }}
                                    value="mfa"
                                />
                            }
                            label="MultiFactor Auth"
                            />

                         <FormControlLabel
                            control={
                                <Switch
                                    checked={this.state.remember}
                                    disabled={this.state.loading} 
                                    onChange={(evt) => { this.setState({ remember: evt.target.checked }); }}
                                    value="remember"
                                />
                            }
                            label="Remember Device"
                            />
                        </FormGroup>
                    </Grid>
                    <Grid item xs={8} sm={8}>
                        <Button variant="contained" color="primary" disabled={this.state.loading} onClick={this.onSignUp.bind(this)} >
                            Sign Up
                        </Button>
                    </Grid>
                </Grid>
                
            </div>
        );
    }
};

SignUp.propTypes = {
    classes: PropTypes.object.isRequired
};

export default withStyles(styles)(SignUp);