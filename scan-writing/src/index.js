import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

import Amplify from 'aws-amplify'
import config from './aws-exports'

const isLocalhost = !!(window.location.hostname === "localhost");

const [localRedirectSignIn, productionRedirectSignIn] = config.oauth.redirectSignIn.split(",");
const [localRedirectSignOut, productionRedirectSignOut] = config.oauth.redirectSignOut.split(",");

  const updatedAwsConfig = {
    ...config,
    oauth: {
    ...config.oauth,
    redirectSignIn: isLocalhost 
        ? localRedirectSignIn 
        : productionRedirectSignIn,
    redirectSignOut: isLocalhost 
        ? localRedirectSignOut 
        : productionRedirectSignOut, }
    }
    
Amplify.configure(updatedAwsConfig)

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
