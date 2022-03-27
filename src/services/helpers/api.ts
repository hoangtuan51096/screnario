import {USER_TYPE_ADMIN} from "@/constants/permission.constants";

const axios = require("axios");
import Config from "../../config";

export class APIClass {
  userType
  constructor() {
    if (localStorage.user_data !== undefined) {
      this.userType = JSON.parse(localStorage.user_data)?.user_type;
    }
  }
  setHeader() {
    axios.defaults.headers.common["Authorization"] = "Bearer " + localStorage.getItem("jwt");
  }
  setFormData() {
    axios.defaults.headers.common[
        "Content-Type"
        ] = "multipart/form-data";
  }
  get(apiName, path, init) {
    this.setHeader();
    return new Promise((res, rej) => {
      axios
        .get(Config.ADMIN_API_URL + path, init)
        .then((result) => {
          res(result.data);
        })
        .catch((err) => {
          if (err.response.status === 403) {
            window.location.href = '/forbidden';
          }
          if (err.response.status === 401) {
            localStorage.clear();
            if (this.userType == USER_TYPE_ADMIN) {
              window.location.href = '/signin/admin';
            }
            window.location.href = '/signin';
          }
          rej(err);
        });
    });
  }
  /**
   * Make a POST request
   * @param {string} apiName - The api name of the request
   * @param {string} path - The path of the request
   * @param {json} [init] - Request extra params
   * @return {Promise} - A promise that resolves to an object with response status and JSON data, if successful.
   */
  post(apiName, path, init) {
    this.setHeader();
    return new Promise((res, rej) => {
      axios
        .post(Config.ADMIN_API_URL + path, init)
        .then((result) => {
          res(result.data);
        })
        .catch((err) => {
          if (err.response.status === 403) {
            window.location.href = '/forbidden';
          }
          if (err.response.status === 401) {
            localStorage.clear();
            if (this.userType == USER_TYPE_ADMIN) {
              window.location.href = '/signin/admin';
            }
            window.location.href = '/signin'
          }
          rej(err);
        });
    });
  }
  /**
   * Make a PUT request
   * @param {string} apiName - The api name of the request
   * @param {string} path - The path of the request
   * @param {json} [init] - Request extra params
   * @return {Promise} - A promise that resolves to an object with response status and JSON data, if successful.
   */
  put(apiName, path, init) {
    this.setHeader();
    return new Promise((res, rej) => {
      axios
        .put(Config.ADMIN_API_URL + path, init)
        .then((result) => {
          res(result.data);
        })
        .catch((err) => {
          if (err.response.status === 403) {
            window.location.href = '/forbidden';
          }
          if (err.response.status === 422) {
            res(err.response.data);
          }
          if (err.response.status === 401) {
            localStorage.clear();
            if (this.userType == USER_TYPE_ADMIN) {
              window.location.href = '/signin/admin';
            }
            window.location.href = '/signin'
          }
          rej(err);
        });
    });
  }
  /**
   * Make a PATCH request
   * @param {string} apiName - The api name of the request
   * @param {string} path - The path of the request
   * @param {json} [init] - Request extra params
   * @return {Promise} - A promise that resolves to an object with response status and JSON data, if successful.
   */
  patch(apiName, path, init) {
    this.setHeader();
    return new Promise((res, rej) => {
      axios
        .patch(Config.ADMIN_API_URL + path, init)
        .then((result) => {
          res(result.data);
        })
        .catch((err) => {
          if (err.response.status === 403) {
            window.location.href = '/forbidden';
          }
          if (err.response.status === 401) {
            localStorage.clear();
            if (this.userType == USER_TYPE_ADMIN) {
              window.location.href = '/signin/admin';
            }
            window.location.href = '/signin'
          }
          rej(err);
        });
    });
  }
  /**
   * Make a DEL request
   * @param {string} apiName - The api name of the request
   * @param {string} path - The path of the request
   * @param {json} [init] - Request extra params
   * @return {Promise} - A promise that resolves to an object with response status and JSON data, if successful.
   */
  del(apiName, path, init) {
    this.setHeader();
    return new Promise((res, rej) => {
      axios
        .delete(Config.ADMIN_API_URL + path, init)
        .then((result) => {
          res(result.data);
        })
        .catch((err) => {
          if (err.response.status === 403) {
            window.location.href = '/forbidden';
          }
          if (err.response.status === 401) {
            localStorage.clear();
            if (this.userType == USER_TYPE_ADMIN) {
              window.location.href = '/signin/admin';
            }
            window.location.href = '/signin'
          }
          rej(err);
        });
    });
  }
}

export const API = new APIClass();
