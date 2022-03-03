import axios from 'axios';
const instance = axios.create({ baseURL: 'http://pixel.id:8181/api' });
export default instance