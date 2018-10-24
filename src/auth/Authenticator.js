import React, { Component } from 'react';
import { Button, Grid, withStyles, Paper, Typography, Grow, Collapse, Fade, CircularProgress } from '@material-ui/core';
import PropTypes from 'prop-types';
import Login from './Login';
import SignUp from './SignUp';
import Code from './Code';
import ForgotPwd from './ForgotPwd';
import { Auth } from 'aws-amplify';
import { GcpExports, AwsExports } from '../cloud/CloudExports';
import GoogleLogin from 'react-google-login';
import AWS from 'aws-sdk';
import BackendExports from '../BackendExports';

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
    googleLogin: {
        background: 'white',
        width: 'auto',
        height: 'auto',
        'border-width': '0px',
        'margin-bottom': '8px'
    }
});

class Authenticator extends Component {
    constructor(props) {
        super();
        this.state = {
            provider: null,
            syllaToken: null,
            loading: true,
            viewLogin: false,
            viewSignUp: false,
            viewForgotPwd: false,
            codeConfig: null
        };
    }

    //Called on component initialization
    componentWillMount() {
        //Wait for google login to load
        window.gapi.load('auth2', () => 
        { 
            this.gAuth = window.gapi.auth2.init({
                client_id: GcpExports.clientID
            });
            this.gAuth.then(() => {
                //Check if a google user is logged in
                this.googleSignIn().catch(() => {
                    this.userPoolSignIn().catch(() => {
                        this.signIn(null, null).catch((err) => {
                            console.log("No sign in methods worked!");
                        });
                    });
                });
            }, (e) => {
                console.error("Google auth error: ", e);
            })
        });
    }

    onGoogleSignIn(gs) {
        this.gAuth.isSignedIn.listen(() => {
            this.googleSignIn().then((syllaToken) => {
                fetch(BackendExports.Url + '/api/exchangegoogle', 
                {
                    method: 'POST',
                    headers: new Headers({
                        "authorization": syllaToken
                    }),
                    credentials: 'include',
                    body: JSON.stringify({
                        code: gs.code
                    })
                })
                .then((response) => {
                    if (response.ok) {
                        console.log("REFRESH TOKEN SUBMITTED");
                    }
                })
            }).catch((e) => {
                console.error("Google Sign in failed: ", e)
            });
        });
    }

    googleSignIn() {
        return new Promise((resolve, reject) => {
            this.gAuth = window.gapi.auth2.getAuthInstance();
            if (this.gAuth.isSignedIn.get()) {
                var user = this.gAuth.currentUser.get();
                var idToken = user.getAuthResponse().id_token;
                //Sign in using saved id token
                this.signIn("accounts.google.com", idToken).then((syllaToken) => {
                    resolve(syllaToken);
                }).catch((err) => {
                    reject(err);
                });
            } else {
                reject();
            }
        });
    }
    
    onUserPoolSignIn(user, error) {
        if (error != null) {
            console.log("Sign in failed... Redirecting to login");
            this.setState({ viewLogin: true, viewSignUp: false, viewForgotPwd: false, codeConfig: null });
            return;
        }
        this.userPoolSignIn().then(() => {
            this.setState({ viewLogin: false, viewSignUp: false, viewForgotPwd: false, codeConfig: null });
        }).catch((err) => {
            this.setState({ viewLogin: true, viewSignUp: false, viewForgotPwd: false, codeConfig: null });
        });
    }

    userPoolSignIn() {
        return new Promise((resolve, reject) => {
            Auth.currentSession()
            .then(session => {
                this.signIn("cognito-idp.us-west-2.amazonaws.com/us-west-2_y61gBo6cv", session.idToken.getJwtToken()).then((syllaToken) => {
                    resolve(syllaToken);
                }).catch((err) => {
                    reject(err);
                });
            }).catch((err) => {
                reject(err);
            });
        });
    }

    signIn(provider, token) {
        return new Promise((resolve, reject) => {
            this.fedSignIn(provider, token).then(() => {
                this.getSyllaToken().then((syllaToken) => {
                    this.setState({
                        loading: false,
                        provider: provider,
                        syllaToken: syllaToken
                    });
                    this.props.onAuthenticated(syllaToken, provider);
                    resolve(syllaToken);
                }).catch((err) => {
                    reject(err);
                });
            }).catch((err) => {
                reject(err);
            });
        });
    }

    //Exchanges federated identity token for a syllashare token that is easier for the backend to use
    getSyllaToken() {
        return new Promise((resolve, reject) => {
            console.log("ACCESSKEY: ", AWS.config.credentials.accessKeyId);
            console.log("SECRETKEY: ", AWS.config.credentials.secretAccessKey);
            console.log("SESSION TOKEN: ", AWS.config.credentials.sessionToken);
            //Special client to communicate with API Gateway that invokes our Lambda functions
            this.apigClient = window.apigClientFactory.newClient({
                "accessKey": AWS.config.credentials.accessKeyId,
                "secretKey": AWS.config.credentials.secretAccessKey,
                "sessionToken": AWS.config.credentials.sessionToken,
                "region": "us-west-2",
                "syllaToken": null
            });
            var params = {};
            var body = {};
            var additionalParams = {
                headers: {},
                queryParams: {}
            };

            this.apigClient.exchangetokenPut(params, body, additionalParams)
                .then((result) => {
                    console.log("GOT RESP: ", JSON.stringify(result));
                    resolve(result.data["token"]);
                }).catch((err, msg) => {
                    console.log("ExchangeToken Error: " + JSON.stringify(err));
                    reject(err);
                });
            });
    }

    fedSignIn(provider, token) {
        return new Promise((resolve, reject) => {
            AWS.config.region = AwsExports.Auth.region;
            var authConfig = {
                IdentityPoolId: AwsExports.Auth.identityPoolId
            }
            if (provider != null && token != null) {
                var logins = {}
                logins[provider] = token
                authConfig["Logins"] = logins
            }
            console.log("AUTH CONFIG: ", JSON.stringify(authConfig));
            AWS.config.credentials = new AWS.CognitoIdentityCredentials(authConfig);
            AWS.config.credentials.get(() => {
                this.refresh().then(() => {
                    resolve();
                }).catch((e) => {
                    reject(e);
                });
            });
        });
    }

    refresh() {
        return new Promise((resolve, reject) => {
            AWS.config.credentials.refresh((err) => {
                if (err) {
                    reject(err);
                    return;
                }
                
                resolve();
            })
        });
    }

    onSignOut() {
        this.setState({loading: true});
        if (this.gAuth.isSignedIn.get()) {
            this.gAuth.signOut().then(() => {
                this.signIn(null, null);
            });
        } else {
            Auth.signOut()
            .then(data => {
                this.signIn(null, null);
            })
            .catch(err => {
                console.error("SignOut Error: ", err);
                this.setState({loading: false});
            });
        }
    }

    renderLoggedIn() {
        const { classes } = this.props;
        return (<div className={classes.root}>
            <Paper className={classes.paper} onClick={() => {this.setState({ viewLogin: false, viewSignUp: false, viewForgotPwd: false, codeConfig: null })}}>
                <Typography variant="display1" gutterBottom>
                    Hello
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
                    <GoogleLogin
                        className={classes.googleLogin}
                        clientId={GcpExports.clientID}
                        responseType="code"
                        accessType="offline"
                        scope="profile email"
                        uxMode="redirect"
                        redirect_uri="postmessage"
                        onSuccess={this.onGoogleSignIn.bind(this)}
                        onFailure={(e) => {console.error("Google sign in failure: ", e)}}>
                        <Button variant="contained" color="primary">
                            Google
                        </Button>
                    </GoogleLogin>
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
                        <Login onSignIn={this.onUserPoolSignIn.bind(this)} onCode={(codeConfig) => { this.setState({ codeConfig: codeConfig, viewLogin: false }); }} />
                        <br />
                        <Button variant="contained" onClick={() => { this.setState({ viewLogin: false, viewForgotPwd: true }); } }>
                            Forgot Password?
                        </Button>
                    </Paper>
                </Collapse>
                <Collapse in={this.state.viewSignUp}>
                    <Paper elevation={4} className={classes.paper}>
                        <SignUp onSignIn={this.onUserPoolSignIn.bind(this)} onCode={(codeConfig) => { this.setState({ codeConfig: codeConfig, viewSignUp: false }); }} />
                    </Paper>
                </Collapse>
                <Collapse in={this.state.viewForgotPwd}>
                    <Paper elevation={4} className={classes.paper}>
                        <ForgotPwd onCode={(codeConfig) => { this.setState({ codeConfig: codeConfig, viewForgotPwd: false }); }} />
                    </Paper>
                </Collapse>
                <Collapse in={this.state.codeConfig != null}>
                    <Paper elevation={4} className={classes.paper}>
                        <Code onSignIn={this.onUserPoolSignIn.bind(this)} config={this.state.codeConfig} />
                    </Paper>
                </Collapse>
            </div>
        );
    }

    render() {
        const { classes } = this.props;
        if (this.state.loading) {
            return <CircularProgress className={classes.progress} size={50} />;
        } else if (this.state.provider != null) {
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