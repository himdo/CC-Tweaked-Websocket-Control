import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { CssBaseline } from '@mui/material';
import { BrowserRouter, Route, Switch } from "react-router-dom";
import TurtlePortal from './routes/TurtlePortal';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <>
  <CssBaseline />
  <BrowserRouter>
    <Switch>
      <Route path="/portal/:turtleId" component={TurtlePortal}/>
      <Route path="/">
        <App/>
      </Route>
      {/* <Route path="*" element={<App/>}/> */}
    </Switch>
  </BrowserRouter>
  </>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
