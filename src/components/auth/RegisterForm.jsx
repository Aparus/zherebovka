import React from "react";

import { Button, TextField, Paper, Typography, FormHelperText } from "@material-ui/core";
import { connect } from "react-redux";
import { Link, Redirect } from "react-router-dom";
import styles from "./styles";
// import { signUp } from '../../store/actions/authActions';
import { compose } from "redux";
import { firebaseConnect } from "react-redux-firebase";

class RegistrationForm extends React.Component {
  state = { email: "", password: "", username: "" };
  handleChange = e => {
    this.setState({
      [e.target.id]: e.target.value
    });
  };

  handleSubmit = () => {
    const { firebase } = this.props;
    const createNewUser = ({ email, password, username }) => {
      firebase.createUser({ email, password }, { username });
    };

    createNewUser(this.state);
  };

  render() {
    //console.log("this.props", this.props);
    const { authError, auth } = this.props;
    if (auth.uid) return <Redirect to="/" />;
    return (
      <div style={styles.flexContainer}>
        <Paper style={styles.loginForm}>
          <Typography variant="h5" color="primary">
            Регистрация
          </Typography>
          <TextField
            onChange={this.handleChange}
            id="username"
            label="Username"
            type="text"
            margin="normal"
            autoFocus
            fullWidth
          />
          <br />
          <TextField
            onChange={this.handleChange}
            id="email"
            label="Email"
            type="text"
            margin="normal"
            fullWidth
          />
          <br />
          <TextField
            onChange={this.handleChange}
            id="password"
            label="пароль"
            type="password"
            margin="normal"
            fullWidth
          />
          <br />
          <TextField
            onChange={this.handleChange}
            id="confirmPassword"
            label="подтверждение"
            type="password"
            margin="normal"
            fullWidth
          />
          <br />
          <Button
            style={styles.loginButton}
            onClick={this.handleSubmit}
            variant="contained"
            color="primary"
            margin="normal"
          >
            Войти
          </Button>
          <FormHelperText error>{authError ? authError : null}</FormHelperText>
          <FormHelperText>
            Уже зарегистрированы? Тогда <Link to="/login">войдите</Link>.
          </FormHelperText>
        </Paper>
      </div>
    );
  }
}

const mapStateToProps = state => {
  //console.log("state", state);
  return {
    // authError: state.auth.authError,
    auth: state.firebase.auth
  };
};
const mapDispatchToProps = dispatch => {
  return {
    // signUp: creds => dispatch(signUp(creds))
  };
};

export default compose(
  connect(
    mapStateToProps,
    mapDispatchToProps
  ),
  firebaseConnect()
)(RegistrationForm);