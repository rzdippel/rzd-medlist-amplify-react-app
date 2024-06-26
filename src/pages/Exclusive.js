import { Authenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import '../App.css';
import AWS from 'aws-sdk';
import React, { useEffect, useState } from 'react';
import { Auth } from 'aws-amplify'; // Import Auth from aws-amplify

console.log(AWS.config);

const aws_access_key_id = process.env.REACT_APP_AWS_ACCESS_KEY_ID;
const aws_secret_access_key = process.env.REACT_APP_AWS_SECRET_ACCESS_KEY;
const aws_region = process.env.REACT_APP_AWS_REGION;

AWS.config.update({
  accessKeyId: aws_access_key_id,
  secretAccessKey: aws_secret_access_key,
  region: aws_region,
});

//console.log('AWS_ACCESS_KEY_ID:', aws_access_key_id);
//console.log('AWS_SECRET_ACCESS_KEY:', aws_secret_access_key);
//console.log('AWS_REGION:', aws_region);


const dynamoDB = new AWS.DynamoDB.DocumentClient();
const generalTableName = 'Medicine-ria6hoxdzjbghoggl27othwmve-dev';
const personalTableName = 'PersonalMedicineListTable'; // Adjust with your actual DynamoDB table name

function YourComponent() {
  const [items, setItems] = useState([]);
  const [selectedItems, setSelectedItems] = useState({});
  const [showList, setShowList] = useState(false);
  const [selectedLetter, setSelectedLetter] = useState(null);
  const [personalMedicineList, setPersonalMedicineList] = useState([]);

  useEffect(() => {
    const params = {
      TableName: generalTableName,
    };

    const fetchItems = async () => {
      try {
        const data = await dynamoDB.scan(params).promise();
        const retrievedItems = data.Items || [];

        retrievedItems.sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));

        setItems(retrievedItems);
      } catch (error) {
        console.error('Error fetching items:', error);
      }
    };

    fetchItems();
  }, []);

  const handleItemSelect = (item) => {
    setSelectedItems((prevSelectedItems) => ({
      ...prevSelectedItems,
      [item.id]: !prevSelectedItems[item.id],
    }));
  };

  const itemsByLetter = {};
  items.forEach((item) => {
    const firstLetter = item.id.charAt(0).toUpperCase();
    if (!itemsByLetter[firstLetter]) {
      itemsByLetter[firstLetter] = [];
    }
    itemsByLetter[firstLetter].push(item);
  });

  const handleLetterSelect = (letter) => {
    setSelectedLetter(letter);
    setShowList(true);
  };

  useEffect(() => {
    const fetchPersonalMedicineList = async () => {
      try {
        const user = await Auth.currentAuthenticatedUser();
        const userId = user.attributes.sub;

        const response = await dynamoDB.get({
          TableName: personalTableName,
          Key: { userId: userId },
        }).promise();

        const savedMedicineList = response.Item ? response.Item.medicineList : [];
        setPersonalMedicineList(savedMedicineList);
      } catch (error) {
        console.error('Error fetching personal medicine list:', error);
      }
    };

    fetchPersonalMedicineList();
  }, []);

  useEffect(() => {
    const savePersonalMedicineList = async () => {
      try {
        const user = await Auth.currentAuthenticatedUser();
        const userId = user.attributes.sub;

        await dynamoDB.put({
          TableName: personalTableName,
          Item: { userId: userId, medicineList: personalMedicineList },
        }).promise();
      } catch (error) {
        console.error('Error saving personal medicine list:', error);
      }
    };

    savePersonalMedicineList();
  }, [personalMedicineList]);

  const handleAddToPersonalList = () => {
    const selectedMedicinesToAdd = items
      .filter((item) => selectedItems[item.id])
      .map((item) => item.id);

    setPersonalMedicineList((prevList) => [...prevList, ...selectedMedicinesToAdd]);
    setSelectedItems({});
  };

  const handleRemoveFromPersonalList = (medicineId) => {
    setPersonalMedicineList((prevList) => prevList.filter((item) => item !== medicineId));
  };

  const renderSelectedMedicines = () => {
    return personalMedicineList.map((medicineId, index) => (
      <div key={index}>
        {medicineId}
        <button onClick={() => handleRemoveFromPersonalList(medicineId)}>Remove</button>
      </div>
    ));
  };

  return (
    <div className="container">
      <div className="medicine-options">
        <h5>Select the letter your current medicine begins with: </h5>
        {Object.keys(itemsByLetter).map((letter) => (
          <button
            key={letter}
            className="letter-button"
            onClick={() => handleLetterSelect(letter)}
          >
            {letter}
          </button>
        ))}
      </div>
  
      {showList && selectedLetter && (
        <div className="medicine-list">
          <h6>Medicines starting with: {selectedLetter}</h6>
          <ul>
            {itemsByLetter[selectedLetter].map((item) => (
              <li key={item.id}>
                <input
                  type="checkbox"
                  checked={selectedItems[item.id] || false}
                  onChange={() => handleItemSelect(item)}
                />
                {item.id}
              </li>
            ))}
          </ul>
          <button class="add-to-list-button" onClick={handleAddToPersonalList}>
            Add Selected Medicines to Your Personal List
          </button>
        </div>
      )}
  
      <div className="personal-medicine-list">
        <h2>Your Med List:</h2>
        {renderSelectedMedicines()}
      </div>
    </div>
  );
}
const ExclusivePage = () => {

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

  return (
    <Authenticator>
      {({ signOut }) => (
        <div className="exclusive-page">
          <h3>You are authenticated, you may now create your medicine list!</h3>
          <button class="sign-out-button" onClick={signOut}>Sign Out</button>
          <div className="content">
            <YourComponent />
          </div>
        </div>
      )}
    </Authenticator>
  );
};

export default ExclusivePage;
