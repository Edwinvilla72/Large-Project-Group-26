import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // if you're using React Router

// insert code here
function Register() {
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [passwordConfirm, setPasswordConfirm] = useState('');
    const [message, setMessage] = useState('');
    const [isError, setIsError] = useState(false);
    
    const navigate = useNavigate(); // for redirecting


    // performs registeration after clicking the create an accoubt button
    async function doRegister(event: any): Promise<void> {
        event.preventDefault();
      
        // if any fields are empty, error
        if (!firstName || !lastName || !username || !password || !passwordConfirm) {
            setMessage("Please fill in all fields.");
            setIsError(true);
            return;
        }

        // password confirmation check
        if (password != passwordConfirm) {
            setMessage("Passwords do not match.");
            setIsError(true);
            return;
        }

        // if everything is correct, send user info to the database to add the user to it
        const obj = {
            FirstName: firstName,
            LastName: lastName,
            username: username,
            password: password
            // don't need to add confirm password
        };

        // convert to JSON
        const js = JSON.stringify(obj);

        try {
            // call register api
            const response = await fetch('api/register', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: js
            });
            // check response
            const text = await response.text();
            const res = JSON.parse(text);

            //if any error exists, tell user and reject
            if (res.error && res.error.length > 0) {
                setMessage("API Error: " + res.error);
                setIsError(true);
            }
            // otherwise, tell user their account was created and send them to the login page
            else {
                setMessage("Account successfully created!");
                setIsError(false);

                setTimeout(() => {
                    navigate('/');
                }, 1500);     
            }
        } catch (error: any) {
            setMessage("Server error: " + error.toString());
            setIsError(true);
        }
    }


    let _ud: any = localStorage.getItem('user_data');
    let ud = JSON.parse(_ud);


    return (
        <div id="RegisterDiv">
    
        <h1>Sign Up for FitGame!</h1>

        <input type="text" value={firstName} onChange={e => setFirstName(e.target.value)} placeholder="First Name"></input><br></br>
        <input type="text" value={lastName} onChange={e => setLastName(e.target.value)} placeholder="Last Name"></input><br></br>
        <input type="text" value={username} onChange={e => setUsername(e.target.value)} placeholder="Username"></input><br></br>
        <input type="password"value={password} onChange={e => setPassword(e.target.value)} placeholder="Password"></input><br></br>
        <input type="password" value={passwordConfirm} onChange={e => setPasswordConfirm(e.target.value)} placeholder="Confirm Password"></input><br></br>
        <input type="button" id="registerButton" className="buttons" value="Create an Account" onClick={doRegister}/>
        <br></br>
        
        {message && (
                <p style={{
                    color: isError ? 'red' : 'green',
                    marginTop: '10px'
                }}>
                    {message}
                </p>
        )}

    </div>
    );

}

export default Register;