import axios from 'axios'; // tool for making HTTP requests and calling APIs

const setAuthToken = token => {
    if (token) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`; // set the Authorization header with the token
    } else {
        delete axios.defaults.headers.common['Authorization']; // remove the Authorization header
    }
};

export default setAuthToken; // export the function for use in other files