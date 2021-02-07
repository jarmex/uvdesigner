import React from "react";
import "./App.css";
import { ThemeProvider } from "styled-components";
import { theme } from "./Theme";
import { VariableProvider } from "./Context";
import NodeDataProvider from "./Data/NodeDataProvider";
import { Switch, Route, BrowserRouter } from "react-router-dom";
import ShortCodePage from "./Screens/ShortCodes/ShortCodePage";
import MainPage from "./Screens/MainBody/MainPage";
import LoginPage from "./Screens/Login/LoginPage";
import PrivateRoute from "./PrivateRoute";
import Register from "./Screens/Login/Register";
import SettingsScreen from "./Screens/Settings/SettingsScreen";

function App() {
  return (
    <NodeDataProvider>
      <ThemeProvider theme={theme}>
        <VariableProvider>
          <BrowserRouter>
            <Switch>
              <Route path="/changepwd/:id">
                <Register />
              </Route>
              <PrivateRoute path="/shortcodes">
                <ShortCodePage />
              </PrivateRoute>
              <PrivateRoute path="/main/:serviceId">
                <MainPage />
              </PrivateRoute>
              <PrivateRoute path="/settings/mtn">
                <SettingsScreen />
              </PrivateRoute>
              <Route path="/">
                <LoginPage />
              </Route>
            </Switch>
          </BrowserRouter>
        </VariableProvider>
      </ThemeProvider>
    </NodeDataProvider>
  );
}

export default App;
