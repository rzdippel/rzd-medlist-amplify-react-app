import React, { useEffect } from 'react';
import '../App.css';

const Home = () => {
    

    useEffect(() => {
        // Create a new link element for Google Fonts
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&display=swap';

        // Append the link element to the document's head
        document.head.appendChild(link);

        // Clean up function to remove the link when the component unmounts
        return () => {
            document.head.removeChild(link);
        };
    }, []); // Empty dependency array to ensure this effect runs only once

    const text = `
    Signing up requires only an email and allows you to create your personalized medicine list! Click the "Log In/Sign Up" button in the top right corner of the page to get started`;

    return (
        <div> 
            <h1>Welcome to Your Med List!</h1>
            <div className='DirectionsBox'>
                <p className='DirectionsText'>{text}</p>
            </div>
        </div>
    )
    
    

};

export default Home;