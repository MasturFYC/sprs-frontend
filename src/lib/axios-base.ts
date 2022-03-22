import axios from 'axios';
//const instance = axios.create({ baseURL: 'http://localhost:8181/api' });
//const instance = axios.create({ baseURL: 'http://pixel.id:8181/api' });


const instance = axios.create({ baseURL: '/api' });
export default instance