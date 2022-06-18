import { API, Storage } from 'aws-amplify';
import {React, useState } from 'react'
import { useMemo } from 'react';
import {useDropzone} from 'react-dropzone';
import { Modal, Button } from 'react-bootstrap';
import HeaderButton from '../components/HeaderButton';

const baseStyle = {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '20px',
    borderWidth: 2,
    borderRadius: 2,
    borderColor: '#eeeeee',
    borderStyle: 'dashed',
    backgroundColor: '#fafafa',
    color: '#bdbdbd',
    outline: 'none',
    transition: 'border .24s ease-in-out'
  };
  
  const focusedStyle = {
    borderColor: '#2196f3'
  };
  
  const acceptStyle = {
    borderColor: '#00e676'
  };
  
  const rejectStyle = {
    borderColor: '#ff1744'
  };
  
function DropAnImage({getUpdatedImagesFromBackend, userEmail}) { 
    const [title, setTitle] = useState("default")
    const [showModal, setShowModal] = useState(false)
    
    const uploadImage = async () => {

      try {
        await Storage.put(acceptedFiles[0].name, acceptedFiles[0])  
        const apiName = 'textract';
        const path = '/textract';
        const request = {
          headers:{},
          queryStringParameters:{
            "title": title,
            "image": acceptedFiles[0].name,
            "email": userEmail
          }
        };

        try {
          await API.post(apiName, path, request);
          // TODO: check if the response has error
          getUpdatedImagesFromBackend(userEmail) // TODO: destructure the object from the response and create new objects.
        } catch(error) {
          console.log(error);
        }
      } catch(error){
          console.log(error);
      }
  }

    const {
      getRootProps,
      getInputProps,
      isFocused,
      isDragAccept,
      isDragReject,
      acceptedFiles,
      open
    } = useDropzone({accept: 'image/*' // we can change this if we want pdf or something else
    , noClick: true // disabling the click on the grey area, we can enable it by removing it.
    ,noKeyboard: true}); 
  
    const style = useMemo(() => ({
      ...baseStyle,
      ...(isFocused ? focusedStyle : {}),
      ...(isDragAccept ? acceptStyle : {}),
      ...(isDragReject ? rejectStyle : {})
    }), [
      isFocused,
      isDragAccept,
      isDragReject
    ]);
  
    const files = acceptedFiles.map(file => (
      <li key={file.path}>
        {file.path} - {file.size} bytes
      </li>
    ));
        
    return (
        <div className="container mt-5">
            <div {...getRootProps({style})}>
                <input {...getInputProps()} />
                <p>Drag 'n' drop some files here</p>
                <button type="button" onClick={open}>Open File Dialog</button>
            </div>
            <aside>
                <h4>Files</h4>
                <ul>{files}</ul>
            </aside>
            <HeaderButton text="Add Title" color="green" onClick={()=>{
                setShowModal(true)
            }}/>
            <br/>
            <HeaderButton text="Upload" color="green" onClick={async () => {
              //console.log("running 1")
              await uploadImage();
              console.log("running 2")
            }}/>

            <Modal show={showModal} fullscreen={'sm-down'} onHide={() => setShowModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Add title</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <input value={title} onInput={(e) => {
                        setTitle(e.target.value)
                      }}/>
                    <br/>
                    <Button onClick={()=>setShowModal(false)}>Save</Button>
                </Modal.Body>
            </Modal>
        </div>
    );
}

export default DropAnImage