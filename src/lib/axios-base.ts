import axios from 'axios';
//const instance = axios.create({ baseURL: 'http://localhost:8181/api' });
//const instance = axios.create({ baseURL: 'http://pixel.id:8181/api' });
import authHeader from "lib/auth-header";

const instance = axios.create({ baseURL: process.env.REACT_APP_API_URL });
instance.defaults.headers.common['Token'] = authHeader().Token;
export default instance;