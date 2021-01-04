import React from "react";
import "./App.css";
import { ThemeProvider } from "styled-components";
import { theme } from "./Theme";
import { VariableContext, variablesValues } from "./Context";
import NodeDataProvider from "./Data/NodeDataProvider";
import { Switch, Route, BrowserRouter } from "react-router-dom";
import ShortCodePage from "./Screens/ShortCodes/ShortCodePage";
import MainPage from "./Screens/MainBody/MainPage";
import LoginPage from "./Screens/Login/LoginPage";
import PrivateRoute from "./PrivateRoute";
import Register from "./Screens/Login/Register";

function App() {
  return (
    <NodeDataProvider>
      <ThemeProvider theme={theme}>
        <VariableContext.Provider value={{ variable: variablesValues }}>
          <BrowserRouter>
            <Switch>
              <Route path="/changepwd/:id">
                <Register />
              </Route>
              <PrivateRoute path="/shortcodes">
                <ShortCodePage />
              </PrivateRoute>
              <PrivateRoute path="/main/:id">
                <MainPage />
              </PrivateRoute>
              <Route path="/">
                <LoginPage />
              </Route>
            </Switch>
          </BrowserRouter>
        </VariableContext.Provider>
      </ThemeProvider>
    </NodeDataProvider>
  );
}

export default App;
