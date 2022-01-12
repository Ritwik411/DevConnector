import { combineReducers } from "redux";
import alert from "./alert";
import authReducer from "./auth";
// const rootReducer =
export default combineReducers({ alert, authReducer });
