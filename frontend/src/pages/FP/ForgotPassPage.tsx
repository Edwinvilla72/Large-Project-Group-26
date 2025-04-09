import React, { useState } from 'react';

const ForgotPass = () => {

    let _ud: any = localStorage.getItem('user_data');
    let ud = JSON.parse(_ud);

    const [username, setUsername] = useState('');


    function SecurityQuestions() {
        var obj = { username: username};
        var js = JSON.stringify(obj);
        alert(`if username was found on db, send them to answer their security questions.\nIf not, say no user found`);

        // sends user (if they exist) to answer their security question
        window.location.href = '/FPSecurityQuestion';
    }
    return (
        <div id="ForgotPassUserDiv">
    
        <h1>Forgot your Password?!</h1>
        <p>We can help! Please enter your username...</p>

        <input type="text" value={username} onChange={e => setUsername(e.target.value)} placeholder="Username"></input><br></br>
  
        <input type="button" id="FPUserButton" className="buttons" value="Reset Password" onClick={SecurityQuestions}/>
    </div>
    );
}
export default ForgotPass;