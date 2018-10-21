import React from 'react';
import Authenticator from './auth/Authenticator'

const App = () => (
  <Authenticator onAuthenticated={(syllaToken) => {
    
  }}/>
);

export default App;
