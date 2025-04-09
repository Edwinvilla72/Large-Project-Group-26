import React, { useState } from 'react';

function Login() {

    const [message, setMessage] = React.useState('');
    const [loginName, setLoginName] = React.useState('');
    const [loginPassword, setPassword] = React.useState('');

    function handleSetLoginName(e: any): void {
        setLoginName(e.target.value);
    }
    function handleSetPassword(e: any): void {
        setPassword(e.target.value);
    }

    // button to get to regsiter screen
    function RegisterButton() {
        window.location.href = '/register';
    }



    // dologin
    async function doLogin(event: any): Promise<void> {
        event.preventDefault();
        var obj = { login: loginName, password: loginPassword };
        var js = JSON.stringify(obj);
        try {
            const response = await fetch('/api/login',
                {
                    method: 'POST', body: js, headers: {
                        'Content-Type':
                            'application/json'
                    }
                });
            var res = JSON.parse(await response.text());
            if (res.id <= 0) {
                setMessage('User/Password combination incorrect');
            }
            else {
                var user =
                    { firstName: res.firstName, lastName: res.lastName, id: res.id }
                localStorage.setItem('user_data', JSON.stringify(user));
                setMessage('');
                window.location.href = '/cards';
            }
        }
        catch (error: any) {
            alert(error.toString());
            return;
        }
    };

    return (
        <div id="loginDiv">
            <span id="inner-title">PLEASE LOG IN</span><br />
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
            <button id="forgotPasswordButton" onClick={RegisterButton} style={{ 
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
