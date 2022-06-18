import React, { useState } from 'react'
import HeaderButton from './HeaderButton'
import logo from '../logo.svg';
import { Auth } from 'aws-amplify';
import { useEffect } from 'react';

const HeaderComponent = ({setSignInStateInParent}) => {

    const [email, setUser] = useState(null)

    const login = async () => {
        await Auth.federatedSignIn()
            .then(cred => console.log("Cred: " + cred))
            .catch(e => console.log(e));
    }

    const logout = async () => {
        Auth.signOut()
            .then(data => console.log(data))
            .catch(err => console.log(err))
        setUser(null)
    }

    const checkUser = () => {
      Auth.currentAuthenticatedUser()
        .then(user => {
            setUser(user.attributes.email)
            setSignInStateInParent(true, user.attributes.email)
        })
        .catch(err => console.log(err));
    }

    const auth = async () => {
        if(email == null) {
            await login()
        }
        else {
            await logout()
        }
    }

    const buttonText = () => {
        if(email == null) {
            return "Sign in"
        }
        else {
            return "Sign out"
        }
    }

    // TODO: temporary workaround, need to check the lifecycle of this 
    useEffect(()=> {
        checkUser()
    },[])

    //TODO fix text
    return (
        <nav class="navbar navbar-light bg-light">
        <div className='container-fluid align-items-center'>
        <a class="navbar-brand" href="#">
        <img src={logo} alt="logo" style={{width:'60px',height :'60px', backgroundColor:"black", borderRadius:"8px"}}/>
        </a>
        <p className="font-weight-bold" style={{ fontFamily: "cursive",fontSize:"30px", position:"absolute", left:"50%",transform:"translateX(-50%)"}}>SCAN-WRITING</p>
            <div className='d-flex'>
                <h4 style={{fontFamily:"sans-serif"}}> {email} </h4>
                <HeaderButton style={{marginLeft:"10px"}} backgroundColor="green" onClick={async () => await auth()}
                    text={buttonText()}/>
            </div>
        </div>
        </nav>
    )
}

export default HeaderComponent