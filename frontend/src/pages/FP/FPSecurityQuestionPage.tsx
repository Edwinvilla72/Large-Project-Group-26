import React, { useState } from 'react';

const FPSecurityQuestion = () => {

    let _ud: any = localStorage.getItem('user_data');
    let ud = JSON.parse(_ud);

    const [answer, setAnswer] = useState('');


    function SecurityQuestions() {
        var obj = { answer: answer};
        var js = JSON.stringify(obj);
        alert(``);

        // sends user (if they exist) to change their password
        window.location.href = '/ChangePassword';
    }


    return (
        <div id="ForgotPassUserDiv">
    
        <h1>Hi, User!</h1>
        <p>Answer your security question: </p>
        <p>Your Security Question: [Insert question here]</p><br></br>

        <input type="text" value={answer} onChange={e => setAnswer(e.target.value)} placeholder="Your Answer"></input><br></br>
  
        <input type="button" id="FPUserButton" className="buttons" value="Reset Password" onClick={SecurityQuestions}/>
    </div>
    );
}
export default FPSecurityQuestion;