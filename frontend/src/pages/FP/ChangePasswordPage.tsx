import React, { useState } from 'react';

const ChangePassword = () => {

    let _ud: any = localStorage.getItem('user_data');
    let ud = JSON.parse(_ud);

    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');

    function SecurityQuestions() {
        var obj = { newPassword: newPassword, confirmNewPassword: confirmNewPassword };
        var js = JSON.stringify(obj);
        alert(`if username was found on db, send them to answer their security questions.\nIf not, say no user found`);

        // sends user (if they exist) to answer their security question
        window.location.href = '/FPSecurityQuestion';
    }
    return (
        <div id="ForgotPassUserDiv">
    
        <h1>Great!</h1>
        <p>Now you can change your Password!</p>

        <input type="text" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="New Password"></input><br></br>
        <input type="text" value={confirmNewPassword} onChange={e => setConfirmNewPassword(e.target.value)} placeholder="Confirm New Password"></input><br></br>

        <input type="button" id="FPUserButton" className="buttons" value="Reset Password" onClick={SecurityQuestions}/>
    </div>
    );
}
export default ChangePassword;