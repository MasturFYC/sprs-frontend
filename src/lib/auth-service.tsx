import axios from 'lib/axios-base';

export type User = {
  userName: string,
  email: string,
  accessToken?: string
}

const useAuthService = () => {
  return {
    login: (username: string, password: string) => {
      return axios
        .post("/auth/signin", {
          username,
          password
        })
        .then(response => {
          if (response.data.accessToken) {
            localStorage.setItem("user", JSON.stringify(response.data));
            //console.log(response.data)
          }
          return response.data;
        });
    },
    logout: () => localStorage.removeItem("user"),
    register: (username: string, email: string, password: string) => {
      return axios.post("/auth/signup", {
        username,
        email,
        password
      }).then(response => {
        if (response.data.accessToken) {
          localStorage.setItem("user", JSON.stringify(response.data));
        }
        return response.data;
      });
    },
    getCurrentUser: (): User | undefined => {
      const user = localStorage.getItem('user')
      if(user) {
        return JSON.parse(user) as User;
      }
      return undefined;
    }
  }
}

export default useAuthService;