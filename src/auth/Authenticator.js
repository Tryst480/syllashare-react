import React, { Component } from 'react';
import { Button, Grid, withStyles, Paper, Typography, Grow, Collapse, Fade, CircularProgress } from '@material-ui/core';
import PropTypes from 'prop-types';
import Login from './Login';
import SignUp from './SignUp';
import Code from './Code';
import ForgotPwd from './ForgotPwd';
import Amplify from '@aws-amplify/core';
import { Auth } from 'aws-amplify';
import AwsExports from '../aws/AwsExports';
import DeleteRoundedIcon from '@material-ui/icons/';

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

class Authenticator extends Component {
    constructor(props) {
        super();
        this.state = {
            loading: true,
            user: null,
            viewLogin: false,
            viewSignUp: false,
            viewForgotPwd: false,
            codeConfig: null
        };
    }

    componentWillMount() {
        Auth.currentAuthenticatedUser()
            .then(user => {
                console.log("USER: ", user);
                this.setState({loading: false, user: user});
            })
            .catch(err => {
                console.log("USER NULL");
                this.setState({loading: false});
            });
    }

    onSignIn(user, error) {
        if (error != null) {
            console.log("Sign in failed... Redirecting to login");
            this.setState({ viewLogin: true, viewSignUp: false, viewForgotPwd: false, codeConfig: null });
            return;
        }
        console.log("LOGGIN IN");
        this.setState({ user: user, viewLogin: false, viewSignUp: false, viewForgotPwd: false, codeConfig: null });
    }

    onSignOut() {
        this.setState({loading: true});
        Auth.signOut()
            .then(data => {
                this.setState({loading: false, user: null});
            })
            .catch(err => {
                console.error("SignOut Error: ", err);
                this.setState({loading: false});
            });
    }

    renderLoggedIn() {
        const { classes } = this.props;
        return (<div className={classes.root}>
            <Paper className={classes.paper} onClick={() => {this.setState({ viewLogin: false, viewSignUp: false, viewForgotPwd: false, codeConfig: null })}}>
                <Typography variant="display1" gutterBottom>
                    Hello {this.state.user.username}
                </Typography>
                <Button variant="contained" onClick={this.onSignOut.bind(this)}>
                    Sign Out
                </Button>
            </Paper>
        </div>);
    }

    renderLoggedOut() {
        const { classes } = this.props;
        //You cannot pass a null react element so we use an empty div
        var otherOptionButton = <div />;
        if (this.state.viewLogin) {
            otherOptionButton = (<Button variant="contained" onClick={(evt) => { 
                    this.setState({ viewLogin: false, viewSignUp: true });
                    evt.stopPropagation();
                } }>
                Sign Up
            </Button>);
        } else if (this.state.viewSignUp) {
            otherOptionButton = (<Button variant="contained" onClick={(evt) => { 
                this.setState({ viewLogin: true, viewSignUp: false });
                evt.stopPropagation();
            }}>
                Login
            </Button>);
        }
        return (
            <div className={classes.root}>
                <Paper className={classes.paper} onClick={() => {this.setState({ viewLogin: false, viewSignUp: false, viewForgotPwd: false, codeConfig: null })}}>
                    <Typography variant="display1" gutterBottom>
                        Join SyllaShare!
                    </Typography>
                    <br />
                    <Collapse in={!(this.state.viewLogin || this.state.viewSignUp)}>
                        <Grid container justify = "center" spacing={2}>
                            <Grid item xs={4} sm={2}>
                                <Button variant="contained" color="primary" onClick={(evt) => { 
                                        this.setState({ viewSignUp: true, viewForgotPwd: false, codeConfig: null }); 
                                        evt.stopPropagation();
                                    }} >
                                    Sign Up
                                </Button>
                            </Grid>
                            <Grid item xs={4} sm={2}>
                                <Button variant="contained" color="primary" onClick={(evt) => { 
                                        this.setState({ viewLogin: true, viewForgotPwd: false, codeConfig: null });
                                        evt.stopPropagation();
                                    } }>
                                    Login
                                </Button>
                            </Grid>
                        </Grid>
                    </Collapse>
                    <Fade in={this.state.viewLogin || this.state.viewSignUp}>
                        {otherOptionButton}
                    </Fade>
                </Paper>
                <br />
                <Collapse in={this.state.viewLogin}>
                    <Paper elevation={4} className={classes.paper}>
                        <Login onSignIn={this.onSignIn.bind(this)} onCode={(codeConfig) => { this.setState({ codeConfig: codeConfig, viewLogin: false }); }} />
                        <br />
                        <Button variant="contained" onClick={() => { this.setState({ viewLogin: false, viewForgotPwd: true }); } }>
                            Forgot Password?
                        </Button>
                    </Paper>
                </Collapse>
                <Collapse in={this.state.viewSignUp}>
                    <Paper elevation={4} className={classes.paper}>
                        <SignUp onSignIn={this.onSignIn.bind(this)} onCode={(codeConfig) => { this.setState({ codeConfig: codeConfig, viewSignUp: false }); }} />
                    </Paper>
                </Collapse>
                <Collapse in={this.state.viewForgotPwd}>
                    <Paper elevation={4} className={classes.paper}>
                        <ForgotPwd onCode={(codeConfig) => { this.setState({ codeConfig: codeConfig, viewForgotPwd: false }); }} />
                    </Paper>
                </Collapse>
                <Collapse in={this.state.codeConfig != null}>
                    <Paper elevation={4} className={classes.paper}>
                        <Code onSignIn={this.onSignIn.bind(this)} config={this.state.codeConfig} />
                    </Paper>
                </Collapse>
            </div>
        );
    }

    render() {
        const { classes } = this.props;
        if (this.state.loading) {
            return <CircularProgress className={classes.progress} size={50} />;
        } else if (this.state.user != null) {
            return this.renderLoggedIn();
        } else {
            return this.renderLoggedOut();
        }
    }
};

Authenticator.propTypes = {
    classes: PropTypes.object.isRequired
};

export default withStyles(styles)(Authenticator);