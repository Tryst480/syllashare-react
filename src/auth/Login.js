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
    },
    nameField: {
        autoFocus: true
    }
});

class Login extends Component {
    constructor(props) {
        super(props);
        this.state = {
            name: "",
            password: "",
            loading: false,
            errorMsg: null
        };
    }

    componentWillMount() {
        //init code
    }

    onLogin() {
        this.setState({
            loading: true,
            errorMsg: null
        });
        Auth.signIn(this.state.name, this.state.password)
            .then((user) => {
                console.log("SignIn: ", user);
                this.props.onSignIn(user);
                this.setState({
                    loading: false
                });
            })
            .catch((err) => {
                console.error("SignInErr: ", err);
                if (err.code == "UserNotConfirmedException") {
                    this.props.onCode({ "mode": "SIGNIN", "username": this.state.name, "password": this.state.password });
                } else {
                    this.setState({
                        errorMsg: err.message
                    });
                }
                this.setState({
                    loading: false
                });
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
                            label="Name or Email"
                            className={`${classes.textField} ${classes.nameField}`}
                            value={this.state.name}
                            disabled={this.state.loading} 
                            onChange={(evt) => { this.setState({name: evt.target.value}); }}
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
                        <Button variant="contained" color="primary" disabled={this.state.loading} onClick={this.onLogin.bind(this)}>
                            Login
                        </Button>
                    </Grid>
                </Grid>
            </div>
        );
    }
};

Login.propTypes = {
    classes: PropTypes.object.isRequired
};

export default withStyles(styles)(Login);