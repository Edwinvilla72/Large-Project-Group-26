import React, { useState } from 'react';

const RegisterPage = () => {

    let _ud: any = localStorage.getItem('user_data');
    let ud = JSON.parse(_ud);
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [passwordConfirm, setPasswordConfirm] = useState('');

    function register() {
        var obj = { firstName: firstName, lastName: lastName, username: username, password: password, passwordConfirm: passwordConfirm };
        var js = JSON.stringify(obj);
        alert("This is where you implement the Registration Logic!\nSend all info from this screen to the database (presumably the Users collection)");
        alert(`${js}`);

        // during actual implementation, put an if condition here checking if the user actually completed inputs properly
            // if so, send to db and send them back to the main page
            // else, keep them here and highlight what it is that needs to change before the account can be created 


        window.location.href = '/';
    }
    return (
        <div id="RegisterDiv">
    
        <h1>Sign Up for FitGame!</h1>

        <input type="text" value={firstName} onChange={e => setFirstName(e.target.value)} placeholder="First Name"></input><br></br>
        <input type="text" value={lastName} onChange={e => setLastName(e.target.value)} placeholder="Last Name"></input><br></br>
        <input type="text" value={username} onChange={e => setUsername(e.target.value)} placeholder="Username"></input><br></br>
        <input type="password"value={password} onChange={e => setPassword(e.target.value)} placeholder="Password"></input><br></br>
        <input type="password" value={passwordConfirm} onChange={e => setPasswordConfirm(e.target.value)} placeholder="Confirm Password"></input><br></br>
        <input type="button" id="registerButton" className="buttons" value="Create an Account" onClick={register}/>
    </div>
    );
}
export default RegisterPage;