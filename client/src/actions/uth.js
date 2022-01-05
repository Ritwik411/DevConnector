import axios from "axios";
import { REGISTER_FAIL, REGISTER_SUCCESS } from "./types";

//Register User
export const register =
  ({ name, email, password }) =>
  async (dispatch) => {
    const config = {
      headers: {
        "Content-Type": "application/json",
      },
    };
  };
