import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // if you're using React Router

function Login() {

    const [message, setMessage] = React.useState('');
    const [loginName, setLoginName] = React.useState('');
    const [loginPassword, setPassword] = React.useState('');
    const navigate = useNavigate(); // for redirecting
    function handleSetLoginName(e: any): void {
        setLoginName(e.target.value);
    }
    function handleSetPassword(e: any): void {
        setPassword(e.target.value);
    }

    // button to get to regsiter screen
    function RegisterButton() {
        navigate('/register');
    }

    function ForgotPassword () {
        navigate('/ForgotPass');
    }


    // dologin
    async function doLogin(event: any): Promise<void> {
        event.preventDefault();
        const obj = { login: loginName, password: loginPassword };
        const js = JSON.stringify(obj);
    
        try {
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: js
            });
    
            const text = await response.text();
    
            if (!response.ok) {
                // backend returned 401, 400, etc.
                const errRes = JSON.parse(text);
                setMessage(errRes.error || 'Login failed.');
                return;
            }
    
            const res = JSON.parse(text);
    
            if (!res._id || res._id <= 0) {
                setMessage('User/Password combination incorrect');
                return;
            }
    
            const user = {
                FirstName: res.FirstName,
                LastName: res.LastName,
                _id: res._id
            };
    
            localStorage.setItem('user_data', JSON.stringify(user));
            setMessage('');
            // sends user to next page (will become dashboard soon)
            navigate('/cards');
        } catch (error: any) {
            console.error('Login error:', error);
            setMessage('Server error. Please try again later.');
        }
    }
    

    return (
        <div id="loginDiv">
            <span id="inner-title">Sign In</span><br />
            <input type="text" id="loginName" placeholder="Username" onChange={handleSetLoginName} /><br></br>
            <input type="password" id="loginPassword" placeholder="Password" onChange={handleSetPassword} /><br></br>
            <input type="submit" id="loginButton" className="buttons" value="Login"
                onClick={doLogin} />
            <span id="loginResult">{message}</span>
            
            <br></br>
            <br></br>
            <br></br>
            
            <input type="button" id="registerButton" className="buttons" value="Create an Account" onClick={RegisterButton} /><br></br>
            <br></br>
            <button id="forgotPasswordButton" onClick={ForgotPassword} style={{ 
                background: 'none', 
                border: 'none', 
                color: 'white', 
                textDecoration: 'underline',
                cursor: 'pointer',
                padding: 0,
                font: 'inherit'
            }}>
            Forgot Password?
            </button>

        </div>
    );
};
export default Login;
