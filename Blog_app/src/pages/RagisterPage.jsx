import { useState } from 'react'
import '../App.css'
import { json } from 'react-router-dom';

export default function RagisterPage(){
    const [username,setUsername]=useState("");
    const [password,setPassword]=useState("");
    async function Ragister(event){
        event.preventDefault();
       const response= await fetch('http://localhost:4000/register',{
            method:'POST',
            body:JSON.stringify({username,
                password
            }),
            headers:{'Content-Type':'application/json'}
        });
        if(response.status ===200){
            alert('registration successful!');
        }
        else{
            alert('registation failed');          
        }

    }
    return(
        
        <form action="" className="formelement" onSubmit={Ragister}>
            <h1>Register</h1>
            <input type="text" placeholder="username" value={username} onChange={event=>{
                setUsername(event.target.value);
            }} />
            <input type="password" placeholder="password" value={password} onChange={event=>{
                setPassword(event.target.value);
            }}/>
            <button>Ragister</button>
        </form>
    )
}
