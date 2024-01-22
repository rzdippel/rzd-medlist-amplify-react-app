import React from 'react';
import '../App.css';

const Home = () => {
    
    const text = `
    Directions: 
    1. To sign up for an account, hit the "Exclusive Page" button in the top-right corner, it only requires an email!
    2. Once logged in, you may select your medicines from our database and create your personalized list of medicines.`;

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