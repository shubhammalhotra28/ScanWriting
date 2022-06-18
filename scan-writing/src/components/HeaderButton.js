import { Button } from "react-bootstrap";
import React from 'react'

const HeaderButton = ({text,...rest}) => {
    return (
        <div>
            <Button {...rest}>
                    {text} 
            </Button>
        </div>
        )
    }
    
HeaderButton.defaulProps = {
    color:'steelBlue'
}


export default HeaderButton