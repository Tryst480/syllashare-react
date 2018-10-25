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
import { Button, Grid, Select, MenuItem } from '@material-ui/core';
import { Parallax, Icon } from 'react-parallax';
import EditIcon from '@material-ui/icons/Edit';
import CancelIcon from '@material-ui/icons/Cancel';
import DoneIcon from '@material-ui/icons/Done';
import Grow from '@material-ui/core/Grow';
import Calendar from './Calendar';
import InvitationList from './InvitationList';
import GroupList from './GroupList';
import ClassList from './ClassList';

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
    width: 300,
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
   }
});

class Profile extends React.Component {
  state = {
    name: "",
    firstName: "",
    lastName: "",
    email: "",
    school: "No School"
  };

  handleChange = name => event => {
    this.setState({
      [name]: event.target.value,
    });
  };

  render() {
    const { classes } = this.props;

    return (
      <div>
        <Parallax
          blur={5}
          bgImage={require('./imgs/background.jpg')}
          bgImageAlt="the cat"
          strength={800}>
          <div style={{ height: '300px' }}>
            <Button color="primary" variant="contained" className={classes.topRightCorner}>
              Log Out
            </Button>
            <Select
              value={this.state.school}
              onChange={(event) => {
                console.log(event.target.value);
                this.setState({
                  school: event.target.value
                });
              }}
              inputProps={{
                name: 'school',
                id: 'school-simple',
              }}
              disabled={!this.state.editing}
              className={classes.topLeftCorner}>
                <MenuItem value={"No School"}>
                  No School
                </MenuItem>
                <MenuItem value={"CPP"}>CPP</MenuItem>
                <MenuItem value={"UCSD"}>UCSD</MenuItem>
                <MenuItem value={"UCI"}>UCI</MenuItem>
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
                value={this.state.username}
                onChange={this.handleChange('username')}
                margin="normal"
              />

              <TextField InputLabelProps={{ shrink: true }}
                disabled={!this.state.editing}
                id="filled-firstname"
                label="First Name"
                className={classes.textField}
                value={this.state.username}
                onChange={this.handleChange('firstname')}
                margin="normal"
              />

              <TextField InputLabelProps={{ shrink: true }}
                disabled={!this.state.editing}
                id="filled-lastname"
                label="Last Name"
                className={classes.textField}
                value={this.state.username}
                onChange={this.handleChange('lastname')}
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
                <Button variant="fab"
                  aria-label="Done" className={classes.greenButton}
                  onClick={() => {console.log("DONE")}}>
                  <DoneIcon />
                </Button>
                
                <Button variant="fab"
                  aria-label="Cancel" className={classes.redButton}
                  onClick={() => {this.setState({editing: false})}}>
                  <CancelIcon />
                </Button>
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
                      <TableCell className={classes.calButton}><Button variant="contained" color="primary">Link</Button></TableCell>
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
                <ClassList />
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
      </div>
    );
  }
}

Profile.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(Profile);