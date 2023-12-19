import { Authenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import '../App.css';
import AWS from 'aws-sdk';
import React, { useEffect, useState } from 'react';
import { Auth } from 'aws-amplify'; // Import Auth from aws-amplify

AWS.config.update({
  accessKeyId: 'AKIAS2E3BVXB2SNSMAID',
  secretAccessKey: '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',
  region: 'us-east-1',
});

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
          <button onClick={handleAddToPersonalList}>
            Add Selected Medicines to Your Personal List
          </button>
        </div>
      )}
  
      <div className="personal-medicine-list">
        <h2>Your Personalized Med List:</h2>
        {renderSelectedMedicines()}
      </div>
    </div>
  );
}
const ExclusivePage = () => {
  return (
    <Authenticator>
      {({ signOut }) => (
        <div className="exclusive-page">
          <h3>You are authenticated, you may now create your medicine list!</h3>
          <button onClick={signOut}>Sign Out</button>
          <div className="content">
            <YourComponent />
          </div>
        </div>
      )}
    </Authenticator>
  );
};

export default ExclusivePage;
