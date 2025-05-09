import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';


function Chat() {

    
    const API_URL = "https://api.openai.com/v1/chat/completions";   // for chat completions

    //const promptInput = document.getElementById("promptInput");     // stores prompt input
    const generateBtn = document.getElementById("generateBtn");     // generate button
    const resultText = document.getElementById("resultText");       // stores result text    


    const [disabled, setDisabled] = useState(false);  // disables generate button when generating content
    const [prompt, setPrompt] = useState("");         // tracks user input
    const [result, setResult] = useState("");         // result

    // asynchronous function to generate text
    const generate = async () => {

        // if there is no input in the prompt, don't send it to ChatGPT
        if (!prompt.trim()) {
            alert("Please enter text into your message.");
            return;
        }

        setDisabled(true); // while response is being generated, disable the button
        setResult("");

        try {
 
            const response = await fetch("http://localhost:3000/api/generate", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({ prompt })
              });

            // take the response as JSON and take the first choice response to print to the console
            const data = await response.json(); // data
            

            if (!response.ok) {
                throw new Error(data.error?.message || 'OpenAI request failed');
            }
            
            // last lines
            setResult(data.result);
        }
        catch (error) {
            setResult("Error ocurred while generating.");   // returns an error to the user
            console.log("Frontend Error: ", error);                  // displays error in the console
        }
        finally {
            // after response is generated...
            setDisabled(false); // re-enable the button once generating is completed
        }
    };

    // back button 
    function back() {
        window.location.href = "/Dashboard";
    }

    // page contents
    return (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="neon-login-container">
            <h1 className="neon-title">Chat With AI</h1>
      
            <label htmlFor="promptInput" style={{ fontWeight: 'bold' }}>Enter prompt:</label><br />
            <input id="promptInput"
              type="text"
              value={prompt}                              // sets value of input text to 'prompt'
              onChange={(e) => setPrompt(e.target.value)} // allows prompt value to update 
              placeholder="Type something..."
              style={{ width: '100%', padding: '10px', marginTop: '6px', marginBottom: '10px', borderRadius: '5px' }}
            />
      
            <div style={{ textAlign: 'center' }}>

              <button id="generateBtn" className="button" style={{ marginRight: '10px' }} onClick={generate} disabled={disabled} >Generate</button>

              <button className="button" onClick={back}> Back </button>

            </div>
      
            <div id="resultContainer" style={{ marginTop: '20px', padding: '10px', backgroundColor: '#d0d0d0', borderRadius: '5px', minHeight: '100px' }}>
              <p style={{ fontWeight: 'bold', color: '#000000' }}>Generated Text:</p>
              <p id="resultText" style={{ color: "black", whiteSpace: 'pre-line' }}>{result}</p>
            </div>
          </div>
        </motion.div>
      );
      

}

export default Chat;
