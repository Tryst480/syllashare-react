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

const styles = theme => ({
  container: {
    display: 'flex',
    flexWrap: 'wrap',
  },
  textField: {
    marginLeft: theme.spacing.unit,
    marginRight: theme.spacing.unit,
    width: 200,
  },
  dense: {
    marginTop: 19,
  },
  menu: {
    width: 200,
  },
  blueAvatar: {
    margin: 50,
    color: '#fff',
    backgroundColor: blue[500],
  },
  bigAvatar: {
    width: 150,
    height: 150,
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
});

class Profile extends React.Component {
  state = {
    name: 'User Name',
    email: 'User Email',
    date: 'Date Joined'
  };

  handleChange = name => event => {
    this.setState({
      [name]: event.target.value,
    });
  };

  render() {
    const { classes } = this.props;

    return (

      <form className={classes.container} noValidate autoComplete="off">

        <Avatar className={classNames(classes.blueAvatar, classes.bigAvatar)}>Ted</Avatar>

        <TextField InputLabelProps={{ shrink: true }}
          id="filled-name"
          label="Name"
          className={classes.textField}
          value={this.state.name}
          onChange={this.handleChange('name')}
          margin="normal"
        />

        <TextField InputLabelProps={{ shrink: true }}
          id="filled-email"
          label="Email"
          className={classes.textField}
          value={this.state.email}
          onChange={this.handleChange('email')}
          margin="normal"
        />

        <TextField InputLabelProps={{ shrink: true }}
          id="filled-name"
          label="Date Joined"
          className={classes.textField}
          value={this.state.date}
          onChange={this.handleChange('date')}
          margin="normal"
        />

        <Paper className={classes.root}>
            <Table className={classes.table}>
            <TableHead>
                <TableRow>
                <TableCell></TableCell>
                <TableCell>Google Calendar</TableCell>
                <TableCell>Microsoft Calendar</TableCell>
                <TableCell>iPhone Calendar</TableCell>
                </TableRow>
                <TableRow>
                <TableCell>Calendar Synced</TableCell>
                </TableRow>
            </TableHead>
            </Table>
        </Paper>
        </form>
    );
  }
}

Profile.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(Profile);