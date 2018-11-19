import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import Avatar from '@material-ui/core/Avatar';
import blue from '@material-ui/core/colors/blue';
import { withStyles } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import Table from '@material-ui/core/Table';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import { Button, Grid, Select, MenuItem, CircularProgress, Snackbar, IconButton } from '@material-ui/core';
import { Parallax, Icon } from 'react-parallax';
import EditIcon from '@material-ui/icons/Edit';
import CancelIcon from '@material-ui/icons/Cancel';
import DoneIcon from '@material-ui/icons/Done';
import Grow from '@material-ui/core/Grow';
import Calendar from './Calendar';

import GroupList from './GroupList';
import ClassList from './ClassList';
import ClassEdit from './ClassEdit';
import Amplify, { Storage, Auth, Hub } from 'aws-amplify';
import BackendExports from './BackendExports';
import CloseIcon from '@material-ui/icons/Close';
import { GcpExports } from './cloud/CloudExports';
import GoogleLogin from 'react-google-login';


const styles = theme => ({
  container: {
    display: 'flex',
    flexWrap: 'wrap',
  },
  button: {
    margin: theme.spacing.unit,
  },
  textField: {
    marginLeft: theme.spacing.unit,
    marginRight: theme.spacing.unit,
    width: 300
  },
  bigFont: {
    fontSize: 'x-large'
  },
  blueAvatar: {
    margin: 30,
    color: '#fff',
    backgroundColor: blue[500],
  },
  bigAvatar: {
    "margin-top": "-175px",
    "width": 225,
    "height": 225,
    "border-style": "solid",
    "border-width": "medium",
    "font-size": "150px"
  },
  row: {
    display: 'flex',
    justifyContent: 'center',
  },
  root: {
    width: '100%',
    marginTop: theme.spacing.unit * 3,
    overflowX: 'auto',
  },
  table: {
    minWidth: 700,
  },
  calButton: {
    "text-align": "center",
    justifyContent: 'center'
  },
  gone: {
    visibility: "gone"
  },
  visible: {
    visibility: "visible"
  },
  greenButton: {
    "margin": "0px 20px",
    "background-color": "#00CC00"
  },
  redButton: {
    "margin": "0px 20px",
    "background-color": "#CC0000"
  },
  topRightCorner: {
    position: "absolute",
    top: 0,
    right: 0,
    margin: "5px"
   },
   topLeftCorner: {
     position: "absolute",
     top: 0,
     margin: "5px"
   },
   googleLogin: {
    background: 'white',
    width: '85%',
    'margin-top': '10px',
    'vertical-align': 'middle',
    'border-width': '0px'
  }
});

class Profile extends React.Component {
  constructor() {
    super();
    this.state = {
      fields: null,
      user: null,
      schools: [],
      updating: false,
      errorMsg: null,
        mainPage: true
    };
  }

  //Called on component initialization
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
      console.error("GetUser Ex: ", err);
    });
    this.getUserData(this.props["syllaToken"]);
  }

  getUserData(syllaToken) {
    this.setState({
      "fields": null,
      "user": null
    })
    fetch(BackendExports.Url + '/api/getuser', 
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
      this.setState({
        "fields": response,
        "user": response
      });
    }).catch((err) => {
      console.error("GetUser Ex: ", err);
    });
  }

  componentWillReceiveProps(nextProps) {
    this.getUserData(nextProps["syllaToken"]);
  }

  handleChange = name => event => {
    this.setState({
      fields: {
        [name]: event.target.value
      }
    });
  };

  onUpdate() {
    this.setState({
      updating: true
    });
    var changedBody = {};
    for (var key in this.state.fields) {
      if (this.state.user[key] != this.state.fields[key]) {
        changedBody[key] = this.state.fields[key];
      }
    }
    console.log("CHANGED BODY: ", changedBody);
    fetch(BackendExports.Url + '/api/modifyuser', 
    {
        method: 'POST',
        headers: new Headers({
            "authorization": this.props["syllaToken"]
        }),
        credentials: 'include',
        body: JSON.stringify(changedBody)
    })
    .then((response) => {
      if (response.ok) {
        var newUser = this.state.user;
        for (var key in changedBody) {
          newUser[key] = changedBody[key];
        }
        this.setState({
          updating: false,
          editing: false,
          user: newUser
        });
      } else {
        return response.json();
      }
    })
    .then((response) => {
      if (response != null) {
        this.setState({
          updating: false,
          errorMsg: response["msg"]
        });
      }
    })
    .catch((err) => {
      console.error("GetUser Ex: ", err);
    });
  }

  onSnackClose() {
    this.setState({ errorMsg: null });
  }

  onGoogleSignIn(gs) {
    fetch(BackendExports.Url + '/api/exchangegoogle', 
    {
        method: 'POST',
        headers: new Headers({
            "authorization": this.props.syllaToken
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
  }

  topBar() {
      const { classes } = this.props;
      return (<Snackbar
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
                  <CloseIcon/>
              </IconButton>,
          ]}
      />);
  }


  renderMainPage() {
      const { classes } = this.props;
    return(<div>
        {this.topBar()}
          <Parallax
              bgImage={require('./imgs/background.jpg')}
              bgImageAlt="School"
              strength={300}>
              <div style={{ height: '300px' }}>
                  <Button color="primary" variant="contained" className={classes.topRightCorner} onClick={() => {
                      this.setState({
                          user: null,
                          fields: null
                      });
                      Auth.signOut()
                  }}>
                      Log Out
                  </Button>
                  <Select
                      value={(this.state.fields.school != null)? this.state.fields.school.name: "No School"}
                      onChange={(event) => {
                          console.log(event.target.value);
                          if (event.target.value != null) {
                              this.setState({
                                  fields: {
                                      school: {
                                          name: event.target.value
                                      }
                                  }
                              });
                          } else {
                              this.setState({
                                  fields: {
                                      school: null
                                  }
                              });
                          }
                      }}
                      inputProps={{
                          name: 'school',
                          id: 'school-simple',
                      }}
                      disabled={!this.state.editing}
                      className={classes.topLeftCorner}>
                      <MenuItem value={null}>
                          No School
                      </MenuItem>
                      {this.state.schools.map((school) => {
                          return <MenuItem value={school.name}>{school.name}</MenuItem>
                      })}
                  </Select>
              </div>
          </Parallax>
          <Grid container
                spacing={0}
                direction="column"
                alignItems="center"
                justify="center">
              <Grid justify="center" item xs={6}>
                  <Avatar className={classNames(classes.blueAvatar, classes.bigAvatar)}>T</Avatar>
              </Grid>
          </Grid>
          <Grid container
                spacing={0}
                direction="column"
                alignItems="center"
                justify="center">
              <Grid item xs={16}>
                  <form noValidate autoComplete="off">
                      <TextField InputLabelProps={{ shrink: true }}
                                 disabled={!this.state.editing}
                                 id="filled-username"
                                 label="Username"
                                 className={classes.textField}
                                 value={this.state.fields.username}
                                 onChange={this.handleChange('username')}
                                 InputProps={{
                                     classes: {
                                         input: classes.bigFont,
                                     },
                                 }}
                                 margin="normal"
                      />

                      <TextField InputLabelProps={{ shrink: true }}
                                 disabled={!this.state.editing}
                                 id="filled-firstname"
                                 label="First Name"
                                 className={classes.textField}
                                 value={this.state.fields.firstName}
                                 onChange={this.handleChange('firstName')}
                                 InputProps={{
                                     classes: {
                                         input: classes.bigFont,
                                     },
                                 }}
                                 margin="normal"
                      />

                      <TextField InputLabelProps={{ shrink: true }}
                                 disabled={!this.state.editing}
                                 id="filled-lastname"
                                 label="Last Name"
                                 className={classes.textField}
                                 value={this.state.fields.lastName}
                                 onChange={this.handleChange('lastName')}
                                 InputProps={{
                                     classes: {
                                         input: classes.bigFont,
                                     },
                                 }}
                                 margin="normal"
                      />

                  </form>
              </Grid>
              <Grid item xs={18}>
                  <Grow in={!this.state.editing}>
                      <div className={(this.state.editing)? classes.gone: classes.visible}>
                          <Button variant="fab" color="primary"
                                  aria-label="Edit" className={classes.button}
                                  onClick={() => {this.setState({editing: true})}}>
                              <EditIcon />
                          </Button>
                      </div>
                  </Grow>
              </Grid>
              <Grid item xs={18}>
                  <Grow in={this.state.editing}>
                      <div>
                          {!this.state.updating && <div>
                              <Button variant="fab"
                                      aria-label="Done" className={classes.greenButton}
                                      onClick={this.onUpdate.bind(this)}>
                                  <DoneIcon />
                              </Button>

                              <Button variant="fab"
                                      aria-label="Cancel" className={classes.redButton}
                                      onClick={() => {this.setState({fields: this.state.user, editing: false})}}>
                                  <CancelIcon />
                              </Button>
                          </div>}
                          {this.state.updating && <CircularProgress className={classes.progress} size={50} />}
                      </div>
                  </Grow>
              </Grid>
              <Grid item xs={18}>
                  <Paper className={classes.root}>
                      <Table className={classes.table}>
                          <TableHead>
                              <TableRow>
                                  <TableCell className={classes.calButton}>Google Calendar</TableCell>
                                  <TableCell className={classes.calButton}>Microsoft Calendar</TableCell>
                                  <TableCell className={classes.calButton}>iPhone Calendar</TableCell>
                              </TableRow>
                              <TableRow>
                                  { (this.state.user.providers.indexOf("google") < 0)
                                      ? <GoogleLogin
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
                                              Link
                                          </Button>
                                      </GoogleLogin>
                                      : <TableCell className={classes.calButton}><Button variant="contained" color="secondary">Unlink</Button></TableCell>
                                  }
                                  <TableCell className={classes.calButton}><Button  variant="contained" color="primary">Link</Button></TableCell>
                                  <TableCell className={classes.calButton}><Button variant="contained" color="primary">Link</Button></TableCell>
                              </TableRow>
                          </TableHead>
                      </Table>
                  </Paper>
              </Grid>
              <Grid item xs={24}>
                  <Grid container spacing={24}>
                      <Grid item xm={8}>
                          <h1>Classes</h1>
                          <ClassList profile={this} />
                      </Grid>
                      <Grid item xm={8}>
                          <h1>Groups</h1>
                          <GroupList />
                      </Grid>
                  </Grid>
              </Grid>
          </Grid>
          <Paper className={classes.root}>
              <Calendar />
          </Paper>
      </div>);
  }

    renderClassEditPage(){
        const { classes } = this.props;
        return(<div>
            {this.topBar()}
            <ClassEdit/>
        </div>);
    }

  render(){
    const { classes } = this.props;
    if (this.state.user == null) {
      return (
      <Grid container
        spacing={0}
        direction="column"
        alignItems="center"
        justify="center">
        <CircularProgress className={classes.progress} size={50} />
      </Grid>);
    }
    else if (this.state.mainPage){
        return this.renderMainPage();
    }
    else if (this.state.classEdit)
    {
        return this.renderClassEditPage();
    }
  }
}

Profile.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(Profile);
