import './App.css';
import "bootstrap/dist/css/bootstrap.min.css" // adding the bootstrap styling
import DropAnImage  from './components/DropAnImage';
import HeaderComponent from './components/HeaderComponent';
import ImageListComponent from './components/ImageListComponent';
import {API} from "aws-amplify";
import React, {useEffect, useState} from 'react';

function App(props) {

  const [images, setImages] = useState([]); // the lifted state
  const [email, setUserEmail] = useState(null)
  
  const getUpdatedImagesFromBackend = (userEmail) => {
    getImages()
  };
  
  const setSignInStateInParent = (isSignedIn, userEmail) => {
    setUserEmail(userEmail)
    console.log("user email is:"+ email)

    if(isSignedIn) {
      postUserData(userEmail)
      getImages()
    }
  }

  const postUserData =  async(userEmail) => {
    const apiName = 'populateuser';
    const path = '/populateuser';
    const request = {
        headers: {},
        queryStringParameters: {
            "user_email": userEmail
        }
    }
    try {
        var data = await API.post(apiName, path, request)
        console.log(data)
        //using these keys :"ALREADY EXIST", "ADDED"
        return true;

    } catch(error) {
      console.log(error)
      return false;
    }
  }

  useEffect(()=>{
    getImages()
  },[email])

  const getImages = async () => {
    const apiName = 'images';
    const path = '/images';
    const request = {
        headers: {},
        queryStringParameters:{
            "user_email": email
        }
    }

    try {
        var data = await API.get(apiName, path, request)
        var array =[]
        for (var i = 0; i < data["Items"].length; i++) {
          var obj = data["Items"][i];
           array.push({
            s3_url: obj["s3_url"],
            notes_translation:"",
            title: obj["title"],
            text: obj["notes_translation"],
            user_id: obj["user_id"],
            id: obj["title"]
          })
        }
        setImages(array)
    } catch(error) {
        console.log(error);
    }
  }

  return (
    <div className="App">
        <HeaderComponent setSignInStateInParent = {setSignInStateInParent}/>
        {email=== null?<p> please sign in or try again later</p>:<DropAnImage getUpdatedImagesFromBackend={getUpdatedImagesFromBackend} userEmail={email}/>}
        {email === null || images === [] ?<p>There are no images to show</p>:<ImageListComponent imageList={images}/>}
    </div>
  );
}

export default App;