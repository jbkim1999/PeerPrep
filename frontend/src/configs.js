const URI_USER_SVC =
  process.env.REACT_APP_URI_USER_SVC || "http://localhost:8000";

const PREFIX_USER_SVC = "/api/user";
const PREFIX_CREATEUSER = "/createuser";
const PREFIX_LOGIN = "/login";
const PREFIX_LOGOUT = "/logout";
const PREFIX_REFRESH_TOKEN = "/renewtokens";
const PREFIX_RESETPASSWORD = "/resetpassword";

export const URL_USER_SVC = URI_USER_SVC + PREFIX_USER_SVC;
export const URL_USER_SVC_CREATEUSER = URL_USER_SVC + PREFIX_CREATEUSER;
export const URL_USER_SVC_LOGIN = URL_USER_SVC + PREFIX_LOGIN;
export const URL_USER_SVC_RESETPASSWORD = URL_USER_SVC + PREFIX_RESETPASSWORD;
export const URL_USER_SVC_LOGOUT = URL_USER_SVC + PREFIX_LOGOUT;
export const URL_USER_SVC_REFRESH_TOKEN = URL_USER_SVC + PREFIX_REFRESH_TOKEN;

export const URI_MATCHING_SVC = 
  process.env.REACT_APP_URI_MATCHING_SVC || "http://localhost:8001";
export const URI_COLLAB_SVC = 
  process.env.REACT_APP_URI_COLLAB_SVC || "http://localhost:3001";
export const URI_QUESTION_SVC = 
  process.env.REACT_APP_URI_QUESTION_SVC || "http://localhost:3002";
export const URI_CHAT_SVC = 
  process.env.REACT_APP_URI_CHAT_SVC || "http://localhost:3003";
