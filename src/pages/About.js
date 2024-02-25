import React, { useEffect }from 'react'; // Import React
import '../App.css'; // Import external CSS file

const About = () => {
  
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
    Bridging the gap between doctor and pharmacy visits!
    Having worked in pharmacy for many years, an issue I 
    have seen countless times is confusion that occurs between 
    doctors and patients in regards to which medicines are 
    current and which have been discontinued. We want to help!
  `;

  const secondHalf = `
    The goal of this website is to let users select their medicines
    and add them to their own, personal medicine list right after 
    doctor's visits to assist in keeping patient's records up to date.
    Then, patients may show their local pharmacies their list of
    meds so that their list can also be updated on their end. Say 
    goodbye to receiving medicines you no longer need and not 
    getting the ones that you do!
  `;

  return (
    <div>
      <h1>Our Goal</h1>
      <div className='PurposeBox'>
        <p className='PurposeText'>{text}</p>
      </div>
      <div className='PurposeBox'>
        <p className='PurposeText'>{secondHalf}</p>
      </div>
    </div>
  );
};

export default About;

