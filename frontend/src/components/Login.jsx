
import React from 'react';
import { useAuth0 } from '@auth0/auth0-react';

const Login = () => {
  const { loginWithRedirect } = useAuth0();

  return (
    <div style={{ textAlign: 'center', marginTop: '3rem' }}>
      <h1>Welcome to Nutrify</h1>
      <button onClick={() => loginWithRedirect()}>Log In</button>
    </div>
  );
};

export default Login;
