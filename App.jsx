import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, FlatList, TouchableOpacity, Modal, StyleSheet, Alert,Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import RNHTMLtoPDF from 'react-native-html-to-pdf';
import RNFS from 'react-native-fs';



const App = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [addItemVisible, setAddItemVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState('');
  const [items, setItems] = useState([]);
  const [newItem, setNewItem] = useState('');
  const [buyingPrice, setBuyingPrice] = useState('');
  const [profit, setProfit] = useState('');
  const [selectedItems, setSelectedItems] = useState([]);

  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = async () => {
    try {
      const savedItems = await AsyncStorage.getItem('dropdownItems');
      if (savedItems) {
        setItems(JSON.parse(savedItems));
      }
    } catch (error) {
      console.error('Failed to load items.', error);
    }
  };

  const saveItems = async (newItems) => {
    try {
      await AsyncStorage.setItem('dropdownItems', JSON.stringify(newItems));
    } catch (error) {
      console.error('Failed to save items.', error);
    }
  };

  const handleAddItem = () => {
    if (newItem.trim()) {
      const updatedItems = [...items, newItem];
      setItems(updatedItems);
      setNewItem('');
      saveItems(updatedItems);
      setAddItemVisible(false); // Hide the add item input box
    }
  };

  const handleSelectItem = (item) => {
    setSelectedItem(item);
    setModalVisible(false);
  };

  const handleAddSelectedItem = () => {
    if (selectedItem && buyingPrice && profit) {
      const sellingPrice = parseFloat(buyingPrice) + parseFloat(profit);
      setSelectedItems([...selectedItems, { item: selectedItem, sellingPrice }]);
      setSelectedItem('');
      setBuyingPrice('');
      setProfit('');
    }
  };

  const handleGeneratePDF = async () => {
    const htmlContent = `
      <html>
        <head>
          <style>
            body {
              font-family: Arial, sans-serif;
              display: flex;
              flex-direction: column;
              align-items: center;
              padding: 0;
              margin: 0;
            }
            .card {
              padding: 40px;
              margin: 20px;
              background-color: #f9f9f9;
              border-radius: 10px;
              box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
              text-align: center;
              width: 100%;
              max-width: 100%;
            }
            .card-item-text {
              font-size: 150px;
              font-weight: bold;
              margin-bottom: 10px;
            }
            .card-price-text {
              font-size: 165px;
              font-weight: bold;
              color: 'black';
              margin-top: 10px;
            }
          </style>
        </head>
        <body>
          ${selectedItems.map(item => `
            <div class="card">
              <div class="card-item-text">${item.item}</div>
              <div class="card-price-text">₹${item.sellingPrice.toFixed(2)}</div>
            </div>
          `).join('')}
        </body>
      </html>
    `;

    try {
      const options = {
        html: htmlContent,
        fileName: `${Date.now()}.pdf`, // Generate a unique filename based on the current date
      };
  
      const file = await RNHTMLtoPDF.convert(options);
  
      const downloadDir = RNFS.DownloadDirectoryPath;
      const destPath = `${downloadDir}/${options.fileName}`;
  
      await RNFS.moveFile(file.filePath, destPath);
  
      Alert.alert('Success', `PDF saved to ${destPath}`);
    } catch (error) {
      console.error('Failed to generate PDF.', error);
      Alert.alert('Error', 'Failed to generate PDF.');
    }
  };
  return (
    <>
     <Image
        source={require('./logo.png')}
        style={styles.image}
        resizeMode="contain"
      />
    
    <View style={styles.container}>
     
      <View style={styles.dropdownContainer}>
        <TouchableOpacity style={styles.dropdown} onPress={() => setModalVisible(true)}>
          <Text style={styles.dropdownText}>{selectedItem || 'Select an item...'}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setAddItemVisible(true)}>
          <Text style={styles.icon}>+</Text>
        </TouchableOpacity>
      </View>

      {selectedItem ? (
        <View style={styles.inputContainer}>
          <TextInput
            value={buyingPrice}
            onChangeText={setBuyingPrice}
            placeholder="Buying Price"
            keyboardType="numeric"
            style={styles.input}
          />
          <TextInput
            value={profit}
            onChangeText={setProfit}
            placeholder="Profit"
            keyboardType="numeric"
            style={styles.input}
          />
          <Button title="Add" onPress={handleAddSelectedItem} />
        </View>
      ) : null}

      {addItemVisible ? (
        <View style={styles.addItemContainer}>
          <TextInput
            value={newItem}
            onChangeText={setNewItem}
            placeholder="Add new item"
            style={styles.input}
          />
          <Button title="Add" onPress={handleAddItem} />
        </View>
      ) : null}

      <FlatList
        data={selectedItems}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.cardItemText}>{item.item}</Text>
            <Text style={styles.cardPriceText}>₹{item.sellingPrice.toFixed(2)}</Text>
          </View>
        )}
        style={styles.list}
      />

      <Button title="Generate PDF" onPress={handleGeneratePDF} />
      <Text style={{textAlign:'center'}}>Developed by Crisbin Joseph</Text>
      <Text style={styles.dev}>contact +91 9961538087</Text>

      <Modal visible={modalVisible} transparent={true} animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <FlatList
              data={items}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity onPress={() => handleSelectItem(item)}>
                  <Text style={styles.modalItem}>{item}</Text>
                </TouchableOpacity>
              )}
              style={styles.modalList}
            />
            <Button title="Close" onPress={() => setModalVisible(false)} />
          </View>
        </View>
      </Modal>
    </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  dropdownContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  image: {
    marginTop:10,
    width: 100,
    height: 60,
    alignSelf:'center',
  },
  dev:{

    color:'blue',
    textAlign:'center',
  },
  dropdown: {
    flex: 1,
    borderColor: '#ccc',
    borderWidth: 1,
    padding: 10,
    borderRadius: 5,
    marginRight: 10,
    
  },
  dropdownText: {
    fontSize: 16,
  },
  icon: {
    fontSize: 30,
    color: 'black',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  
  },
  input: {
    flex: 1,
    borderColor: '#ccc',
    borderWidth: 1,
    padding: 10,
    marginRight: 10,
    borderRadius: 5,
  },
  addItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  list: {
    marginTop: 20,
  },
  card: {
    padding: 30,
    marginVertical: 20,
    marginHorizontal:20,
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    elevation: 3,
    alignItems: 'center',
  },
  cardItemText: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    color:'black',
    marginBottom: 10,
  },
  cardPriceText: {
    fontSize: 20,
    marginTop: 10,
    color: '#333',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContainer: {
    width: '80%',
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    elevation: 5,
  },
  modalList: {
    maxHeight: 200,
  },
  modalItem: {
    padding: 15,
    borderBottomColor: '#ccc',
    borderBottomWidth: 1,
  },
});

export default App;
