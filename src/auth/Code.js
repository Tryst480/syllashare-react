import React, { Component } from 'react';
import { Button, Grid, withStyles, Paper, Typography, TextField, Fade, LinearProgress, Snackbar, IconButton } from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';
import PropTypes from 'prop-types';
import Amplify from '@aws-amplify/core';
import { Auth } from 'aws-amplify';
import { AwsExports } from '../cloud/CloudExports';

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
    }
});

class Code extends Component {
    constructor(props) {
        super(props);
        this.state = {
            code: "",
            password: "",
            loading: false,
            snackMsg: null
        };
    }

    componentWillMount() {
        //init code
    }

    onSubmit() {
        this.setState({loading: true, snackMsg: null});

        var pwd = (this.props.config.password != null)? this.props.config.password : this.state.password;
        //USER VERIFY EMAIL
        if (this.props.config.mode == "SIGNUP") {
            Auth.confirmSignUp(this.props.config.username, this.state.code)
                .then(() => {
                    console.log("PWD: ", pwd);
                    Auth.signIn(this.props.config.username, pwd)
                        .then((user) => {
                            console.log("Code SignUp: ", user);
                            this.props.onSignIn(user);
                            this.setState({loading: false});
                        })
                        .catch((err) => {
                            console.error("Code SignUpErr: ", err);
                            this.props.onSignIn(null, err);
                            this.setState({loading: false, snackMsg: err.message});
                        });
                })
                .catch((err) => {
                    console.error("Code SignUpErr: ", err);
                    this.setState({loading: false, snackMsg: err.message});
                });
        } 
        //ONLY FOR MFA (don't have yet)
        else if (this.props.config.mode == "SIGNIN") {
            Auth.confirmSignIn(this.props.config.username, this.state.code, 'SMS')
                .then((result) => {
                    console.error("Code SignUp: ", result);
                    this.props.onSignIn(result.user);
                    this.setState({loading: false});
                })
                .catch(err => {
                    console.error("Code SignInErr: ", err);
                    this.setState({loading: false, snackMsg: err.message});
                });
        } 
        //ENTERING CODE TO RESET PASSWORD
        else if (this.props.config.mode == "FORGOTPWD") {
            Auth.forgotPasswordSubmit(this.props.config.username, this.state.code, pwd)
                .then((result) => {
                    console.log("Code ForgotPwd: ", result);
                    Auth.signIn(this.props.config.username, pwd)
                        .then((user) => {
                            console.log("Code SignUp: ", result);
                            this.props.onSignIn(user);
                            this.setState({loading: false});
                        })
                        .catch((err) => {
                            console.error("Code SignUpErr: ", err);
                            this.props.onSignIn(null, err);
                            this.setState({loading: false, snackMsg: err.message});
                        });
                })
                .catch(err => {
                    console.error("Code ForgotPwdErr: ", err);
                    this.setState({loading: false, snackMsg: err.message});
                });
        } else {
            console.error("Invalid mode for Code");
            return;
        }
    }

    onResend() {
        this.setState({ loading: true, snackMsg: "Code Resent" });
        Auth.resendSignUp(this.props.config.username)
            .then(() => {
                this.setState({ loading: false, snackMsg: "Code Resent" });
            })
            .catch(err => {
                console.error("Code ForgotPwdErr: ", err);
                this.setState({ loading: false, snackMsg: err.message });
            });
    }

    onSnackClose() {
        this.setState({ snackMsg: null });
    }

    render() {
        if (this.props.config == null) {
            return <div />;
        }
        const { classes } = this.props;
        var gridItems = [];
        gridItems.push(
            <Grid item xs={8} sm={8}>
                <TextField
                    id="code"
                    label="Code"
                    className={classes.textField}
                    value={this.state.code}
                    disabled={this.state.loading} 
                    onChange={(evt) => { this.setState({code: evt.target.value}); }}
                    margin="normal"
                />
            </Grid>);
        if (this.props.config.mode == "FORGOTPWD") {
            gridItems.push(
                <Grid item xs={8} sm={8}>
                    <TextField
                        id="password"
                        label="New Password"
                        className={classes.textField}
                        type="password"
                        value={this.state.password}
                        disabled={this.state.loading} 
                        onChange={(evt) => { this.setState({password: evt.target.value}); }}
                        margin="normal"
                    />
                </Grid>);
        }
        gridItems.push(
            <Grid item xs={12} sm={12}>
                <Button variant="contained" color="primary" disabled={this.state.loading} onClick={this.onSubmit.bind(this)}>
                    Submit
                </Button>
            </Grid>);

        gridItems.push(<br />);

        gridItems.push(
            <Grid item xs={12} sm={12}>
                <Button variant="contained" disabled={this.state.loading} onClick={this.onResend.bind(this)}>
                    Resend
                </Button>
            </Grid>);

        return (
            <div className={classes.root}>
                <Snackbar 
                    anchorOrigin={{vertical: 'bottom', horizontal: 'left'}} 
                    open={(this.state.snackMsg != null)} 
                    autoHideDuration={6000}
                    ContentProps={{
                        'aria-describedby': 'message-id',
                    }}
                    onClose={this.onSnackClose.bind(this)}
                    message={<span id='message-id'>{this.state.snackMsg}</span>}
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
                    {gridItems}
                </Grid>
            </div>
        );
    }
};

Code.propTypes = {
    classes: PropTypes.object.isRequired
};

export default withStyles(styles)(Code);