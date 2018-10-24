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

class ForgotPwd extends Component {
    constructor(props) {
        super(props);
        this.state = {
            username: "",
            loading: false,
            errorMsg: null
        };
    }

    componentWillMount() {
        //init code
    }

    onSubmit() {
        this.setState({loading: true, errorMsg: null});
        Auth.forgotPassword(this.state.username)
            .then((result) => {
                console.log("ForgotPwd: ", result);
                this.props.onCode({ "mode": "FORGOTPWD", "username": this.state.username });
                this.setState({loading: false});
            })
            .catch((err) => {
                console.error("ForgotPwdErr: ", err);
                if (err.code == "InvalidParameterException") {
                    this.props.onCode({ "mode": "SIGNUP", "username": this.state.username });
                }
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
                            id="username"
                            label="Name or Email"
                            className={classes.textField}
                            value={this.state.username}
                            onChange={(evt) => { this.setState({username: evt.target.value}); }}
                            margin="normal"
                        />
                    </Grid>
                    <Grid item xs={8} sm={8}>
                        <Button variant="contained" color="primary" onClick={this.onSubmit.bind(this)}>
                            Submit
                        </Button>
                    </Grid>
                </Grid>
            </div>
        );
    }
};

ForgotPwd.propTypes = {
    classes: PropTypes.object.isRequired
};

export default withStyles(styles)(ForgotPwd);