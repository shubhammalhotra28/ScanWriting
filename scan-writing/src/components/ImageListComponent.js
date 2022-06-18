import {React} from 'react'
import { useState } from 'react'
import { API } from 'aws-amplify';
import { Button, Carousel, Modal } from 'react-bootstrap'

const ImageListComponent = ({imageList}) => {

    const [showModal, setShowModal] = useState(false)
    const [selectedImage, setSelectedImage] = useState({id:0, title:"default", imageUrl:"https://picsum.photos/200"})
    const [targetLanguage, setTargetLanguage] = useState("")
    const [translatedText, setTranslatedText] = useState("")
    const [textSentiment, setTextSentiment] =  useState(null)

    const onImageClick = (event, image) => {
        setSelectedImage({...image})
        setShowModal(true)
    }

    const getSentiment =  async(extractedText) => {
        const apiName = 'comprehend';
        const path = '/comprehend';
        const request = {
            headers: {},
            queryStringParameters:{
                "extractedTexts": extractedText
            }
        }
        try {
            var data = await API.post(apiName, path, request)
            setTextSentiment({
                sentimentDescription:data["Sentiment"]
            })
            console.log(data)
        } catch(error){
          console.log(error)
        }
      }

    const translateToTarget = async (selectedImage) => {
        const apiName = "translate"
        const path = "/translate"
        const request = {
            headers:{},
            queryStringParameters:{
                "texts": selectedImage.text,
                "language":targetLanguage
            }
        }
        console.log(targetLanguage)
        try {
            var data = await API.post(apiName, path, request)
            setTranslatedText(data)
        } catch(error) {
            console.log(error)
        }
        // TODO: possible optimization: update the imageList object 
    }

    return (
        <div>
            
            <>
            {imageList===null || imageList === [] ?<p>There are no images uploaded to the cloud yet!</p> : 
            <Carousel show={3} interval={null} variant='dark'>
            {imageList.map((image) => (
                <Carousel.Item>
                <div key={image.id}
                    style={{display:"inline-block"}}
                    onClick={(e)=> onImageClick(e, image)}>    
                    <h3>{image.title}</h3>
                    <img src={image.s3_url} alt={image.title} width="200px"/>  {/* image is not loading here for some reason */}
                </div>
                </Carousel.Item>
            ))}
            </Carousel>}
            </>

            <Modal show={showModal} fullscreen={true} onHide={() =>{
                setTargetLanguage("")
                setTextSentiment(null)
                setShowModal(false)
                setTranslatedText("")
            }
            }>
                <Modal.Header closeButton>
                    <Modal.Title style={{fontFamily: "sans-serif",position:"absolute", left:"50%",transform:"translateX(-50%)"}}>
                        <h2>{selectedImage.title}</h2>
                        </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className='d-flex justify-content-between'>
                    <div>
                    <h2>Extracted Text</h2>
                    
                    <p>
                        <code>
                        <pre>
                        {selectedImage.text}
                        </pre>
                        </code>
                    </p>

                    </div>
                    <div style={{marginLeft:"40px"}}>
                        <img src={selectedImage.s3_url} alt={selectedImage.title} style={{ maxHeight:"600px", height:"100%"}}/>
                    
                    </div>
                    

                    </div>
                    <div className='d-flex justify-content-between mt-4'>
                        <div>

                        
                    <h1>TRANSLATE</h1>
                    <label>Please specify the target Language:</label>
                    <input value={targetLanguage} onInput={e => setTargetLanguage(e.target.value)} style={{marginLeft:"20px"}}/>
                    
                    <Button onClick={()=>translateToTarget(selectedImage)} style={{marginLeft:"10px"}}>Translate</Button>
                    
                    <code>
                        <pre>
                        {translatedText==="" ? <p>No translation available yet</p>:<p>{translatedText}</p>}
                    </pre>
                    </code>
                    </div>
                    <div style={{marginLeft:"40px"}}>
                    <h1>SENTIMENT ANALYSIS</h1>
                    <code>
                        <pre>
                    {textSentiment === null? <p>There is no sentiment available for the text</p>:<p>{textSentiment.sentimentDescription}</p>}
                    </pre>
                    </code>
                    <Button onClick={()=>getSentiment(selectedImage.text)}>Generate Sentiment</Button>


                    </div>
                                        
                    </div>
                </Modal.Body>
            </Modal>
        </div>
  )
}

export default ImageListComponent