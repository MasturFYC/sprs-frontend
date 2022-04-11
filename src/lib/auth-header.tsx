export default function authHeader() {
  const user = localStorage.getItem('user');
  if (user) {
    const accessUser = JSON.parse(user)
    return { 
      'Token': accessUser.accessToken,
      'Content-Type': 'application/json'
    };
  } else {
    return {};
  }
}