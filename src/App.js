import React from 'react';
import Authenticator from './auth/Authenticator'
import Profile from './Profile'

const App = () => (
  <Authenticator onAuthenticated={(syllaToken) => {
    console.log("IM AUTHENTICATED: ", syllaToken);
  }}/>
);

export default App;
