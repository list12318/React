import React from "react";
import userStore from "./user";

const store = React.createContext({
  userStore: new userStore(),
});

export default () => React.useContext(store);
