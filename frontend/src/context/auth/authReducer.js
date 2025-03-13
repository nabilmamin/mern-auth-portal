const authReducer = (state, action) => {
    switch (action.type) {
        case 'USER_LOADED': 
        // action type is USER_LOADED. 
            return {
                ...state, // spread operater to copy the current state and append to the top level of the new state object
                isAuthenticated: true, // set isAuthenticated to true
                loading: false, // set loading to false
                // setting loading to false means that action has been completed and the loading spinner can be removed
                /* this action is triggered from an api call using the stored token, so the object returned from the backend looks like:
                { 
                id: 1,
                name: 'John Doe',
                email: 'johndoe@example.com'
                } -- this would be the entire user object so we can set user = payload. */
                user: action.payload // set user to the payload of the action (loading the user)
            };
        case 'REGISTER_SUCCESS':
            return {
                ...state,
                loading: false, // updates the registration state to complete
                // we don't authenticate here since email verification is required
            };
        case 'LOGIN_SUCCESS':
            // set the token in local storage, so that the user can stay logged in even after refreshing the page
            // Without this, the user would be logged out every time the browser is closed or the page refreshed
            localStorage.setItem('token', action.payload.token);
            return {
                ...state,
                token: action.payload.token, 
                isAuthenticated: true,
                loading: false,
                //when logging in, the data returned from the backend usually contains both the authentication token AND the user information
                /* {token: 'exampletoken',
                    user: {
                        id: 1,
                        name: 'John Doe',
                        email: '}
                    } */
                user: action.payload.user
            };
        case 'VERIFY_EMAIL_SUCCESS':
            return {
                ...state,
                loading: false,
                // still not authenticated until log in
            };
        case 'FORGOT_PASSWORD_SUCCESS':
            return {
                ...state,
                loading: false
                // No need to update user state for forgot password, as password is not stored client side
            };
        case 'UPDATE_PROFILE_SUCCESS':
            return {
                ...state,
                loading: false,
                user: action.payload //update user state with new user data
            };
        case 'CHANGE_PASSWORD_SUCCESS':
            return {
                ...state,
                loading: false,
                // No need to update user state for change password, as password is not stored client side
            };
        case 'REGISTER_FAIL':
        case 'LOGIN_FAIL':
        case 'AUTH_ERROR':
        case 'VERIFY_EMAIL_FAIL':
        case 'FORGOT_PASSWORD_FAIL':
        case 'CHANGE_PASSWORD_FAIL':
        case 'UPDATE_PROFILE_FAIL':
        case 'LOGOUT':
            localStorage.removeItem('token'); // remove token from local storage
            return {
                ...state,
                token: null,
                isAuthenticated: false,
                loading: false,
                user: null,
                error: action.payload // set error to the payload of the action
            };
        case 'CLEAR_ERRORS':
            return {
                ...state,
                error: null
            };
        default:
            return state;
    };
}

export default authReducer; // export the authReducer function to be used in the AuthState.js file