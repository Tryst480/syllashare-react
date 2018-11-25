import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import Avatar from '@material-ui/core/Avatar';
import blue from '@material-ui/core/colors/blue';
import { withStyles, MuiThemeProvider } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import Table from '@material-ui/core/Table';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import { Button, Grid, Select, MenuItem, CircularProgress, Snackbar, IconButton, Modal, Typography, Collapse } from '@material-ui/core';
import { Parallax, Icon } from 'react-parallax';
import EditIcon from '@material-ui/icons/Edit';
import CancelIcon from '@material-ui/icons/Cancel';
import DoneIcon from '@material-ui/icons/Done';
import Grow from '@material-ui/core/Grow';
import Calendar from './Calendar';
import uuidv4 from 'uuid/v4';

import GroupList from './GroupList';
import ClassList from './ClassList';
import Amplify, { Storage, Auth, Hub, API, graphqlOperation } from 'aws-amplify';
import BackendExports from './BackendExports';
import CloseIcon from '@material-ui/icons/Close';
import { AwsExports, GcpExports } from './cloud/CloudExports';
import GoogleLogin from 'react-google-login';
import Dropzone from 'react-dropzone';
import Cropper from 'react-cropper';
import 'cropperjs/dist/cropper.css';
import * as queries from './graphql/queries';
import * as mutations from './graphql/mutations';
import * as subscriptions from './graphql/subscriptions';

Amplify.configure(AwsExports);

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
    'margin-top': '10px',
    'vertical-align': 'middle',
    'border-width': '0px'
  },
  paper: {
    position: 'absolute',
    width: theme.spacing.unit * 50,
    backgroundColor: theme.palette.background.paper,
    boxShadow: theme.shadows[5],
    padding: theme.spacing.unit * 4,
  },
  collapsePaper: {
    padding: theme.spacing.unit * 2,
    textAlign: 'center',
    color: theme.palette.text.secondary,
    height: 200
},
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

class Profile extends React.Component {
  constructor() {
    super();
    this.state = {
      fields: null,
      user: null,
      schools: [],
      updating: false,
      errorMsg: null,
      editProfileImg: false,
      profileImgFile: null,
      profileImgUploading: false,
      picUrl: null,
      schoolPicUrl: null,
      userEvents: []
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

  getUserEvents() {
    API.graphql(graphqlOperation(queries.getUserEvents, { "userID": this.props.userID })).then((data) => {
      console.log("RESULT: ", data);
      var events = [];
      for (var evt of data.data.getUserEvents) {
        var time = parseInt(evt.time);
        var start = new Date(time);
        var end = new Date(time + evt.mins * 60 * 1000);
        var localID = uuidv4();
        events.push({ "title": evt.name, "start":start, "end": end, "priority": evt.priority, "localID": localID });
      }
      console.log("USER EVENTS", events);
      this.setState({ "userEvents": events });
    }).catch((err) => {
        console.error("GetUserEvents error:", err);
    });
  }

  getUserData(syllaToken) {
    this.setState({
      "fields": null,
      "user": null
    })
    var url = BackendExports.Url + '/api/getuser';
    if (!this.props.thisUser) {
      url += "?id=" + this.props.userID;
    }
    fetch(url, 
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
      Storage.get(response.picKey.substr(7), { level: 'public' })
      .then(picResult => this.setState({ "picUrl": picResult }))
      .catch(err => console.error("GET PIC ERR: " + err));
      if (response.school != null) {
        Storage.get(response.school.picKey.substr(7), { level: 'public' })
        .then(picResult => {console.log("SCHOOL PIC URL: ", picResult); this.setState({ "schoolPicUrl": picResult }) })
        .catch(err => console.error("GET SCHOOL PIC ERR: " + err));
      } else {
        this.setState({ "schoolPicUrl": null })
      }
    }).catch((err) => {
      console.error("GetUser Ex: ", err);
    });
    this.getUserEvents();
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

  onEditCancel() {
    console.log("ON EDIT CANCEL");
    this.setState({fields: this.state.user, editing: false });
    Storage.get(this.state.user.school.picKey.substr(7), { level: 'public' })
        .then(picResult => this.setState({ "schoolPicUrl": picResult }))
        .catch(err => console.error("GET SCHOOL PIC ERR: " + err));
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

  handleEditProfileImgClose() {
    this.setState({
      editProfileImg: false,
      profileImgFile: null
    })
  }

  onDrop(acceptedFiles) {
    this.setState({ "profileImgFile": URL.createObjectURL(acceptedFiles[0]) });
  }

  onCrop() {
    var imgUrl = this.refs.cropper.getCroppedCanvas().toDataURL();
    var reqOpts = {
      body: { "img": imgUrl }, // replace this with attributes you need
      headers: {} // OPTIONAL
    }
    this.setState({ "profileImgUploading": true });
    API.put('SyllaShare', '/profilepic', reqOpts).then(response => {
      this.setState({ 
        profileImgUploading: false,
        editProfileImg: false,
        profileImgFile: null });
      
      Storage.get(response["picKey"].substr(7), { level: 'public' })
      .then(picResult => this.setState({ "picUrl": picResult }))
      .catch(err => console.error("GET PIC ERR: " + err));
    }).catch(error => {
      this.setState({ "profileImgUploading": false });
      console.log(error);
    });
  }

  render() {
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

    var uploadModalContents = (this.state.profileImgFile == null)? (<Dropzone
      style={{"width" : "100%", "height" : "200px", "border" : "1px solid black", "textAlign": "center"}}
      accept="image/*"
      onDrop={this.onDrop.bind(this)}>
      <p>Drag and Drop Profile Picture<br/> (or click to manually select)</p>
    </Dropzone>): (
      <div style={{"text-align": "center"}}>
      <Cropper
        ref='cropper'
        src={this.state.profileImgFile}
        style={{height: 400, width: '100%'}}
        aspectRatio={1 / 1}
        guides={false}/>
        
        <Button style={{marginTop: 30}}color="primary" variant="contained" disabled={this.state.profileImgUploading} onClick={this.onCrop.bind(this)}>Upload</Button>
      </div>);

    return (
      <div>
        <Modal
          aria-labelledby="simple-modal-title"
          aria-describedby="simple-modal-description"
          open={this.state.editProfileImg}
          onClose={this.handleEditProfileImgClose.bind(this)}>
          <div style={getModalStyle()} className={classes.paper}>
            {uploadModalContents}
          </div>
        </Modal>
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
        <Parallax
          bgImage={(this.state.schoolPicUrl == null)? require('./imgs/background.jpg'): this.state.schoolPicUrl}
          bgImageAlt="School"
          strength={300}>
          <div style={{ height: '300px' }}>
            { (this.props.thisUser)? (
              <Button color="primary" variant="contained" className={classes.topRightCorner} onClick={() => {
                this.setState({
                  user: null,
                  fields: null
                });
                Auth.signOut()
              }}>
                Log Out
              </Button>): <div />
            }
            <Select
              style={{background: "#FFFFFF"}}
              value={(this.state.fields.school != null)? this.state.fields.school.name: "No School"}
              onChange={(event) => {
                var schoolName = event.target.value;
                for (var school of this.state.schools) {
                  if (school.name == schoolName) {
                    var newFields = this.state.fields;
                    newFields["school"] = school;
                    console.log("NEW FIELDS: ", newFields);
                    this.setState({
                      fields: newFields
                    });
                    Storage.get(school.picKey.substr(7), { level: 'public' })
                    .then(picResult => this.setState({ "schoolPicUrl": picResult }))
                    .catch(err => console.error("GET SCHOOL PIC ERR: " + err));
                    return;
                  }
                }
                var newFields = this.state.fields;
                newFields["school"] = null;
                this.setState({
                  fields: newFields,
                  schoolPicUrl: null
                });
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
            <Avatar onClick={() => {
              if (this.state.editing) {
                this.setState({ editProfileImg: true })
              }
              }} src={this.state.picUrl} className={classNames(classes.blueAvatar, classes.bigAvatar)}>{this.state.fields.username.substr(0,1).toUpperCase()}</Avatar>
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
          { (this.props.thisUser)? (<div>
              <Grid item xs={18}>
                <Grow in={!this.state.editing}>
                  <div style={{"textAlign": "center"}} className={(this.state.editing)? classes.gone: classes.visible}>
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
                        onClick={this.onEditCancel.bind(this)}>
                        <CancelIcon />
                      </Button>
                    </div>}
                    {this.state.updating && <CircularProgress className={classes.progress} size={50} />}
                  </div>
                </Grow>
              </Grid>
            </div>): <div />
          }
          {
            (this.props.thisUser)? (
            <Grid item xs={3}>
              <Paper className={classes.root}>
                <Table>
                  <TableHead>
                      <TableRow>
                        <TableCell className={classes.calButton}>Google Calendar</TableCell>
                      </TableRow>
                      <TableRow>
                        <div style={{"textAlign": "center"}}>
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
                        </div>
                      </TableRow>
                  </TableHead>
                </Table>
              </Paper>
            </Grid>): <div />
          }
          <Grid item xs={24}>
            <Grid container spacing={24}>
              <Grid item xm={8}>
                <h1>Classes</h1>
                <ClassList userID={this.props.userID} onClassSelected={this.props.onClassSelected} onClassCreate={this.props.onClassCreate} />
              </Grid>
              <Grid item xm={8}>
                <h1>Groups</h1>
                <GroupList myUsername={this.state.user.username} userID={this.props.userID} onGroupSelected={this.props.onGroupSelected} mutable={this.props.thisUser}/>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
        <Paper className={classes.root}>
          <Calendar mutable={false} events={this.state.userEvents} />
        </Paper>
      </div>
    );
  }
}

Profile.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(Profile);
