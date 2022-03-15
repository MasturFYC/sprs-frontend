import axios from 'axios';
const instance = axios.create({ baseURL: 'http://localhost:8282/api' });
//const instance = axios.create({ baseURL: 'http://pixel.id:8282/api' });


// const instance = axios.create({ baseURL: '/api' });
export default instance