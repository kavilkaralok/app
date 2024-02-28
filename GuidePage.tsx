import React from "react";
import { ScrollView, StyleSheet, Text } from "react-native";


const GuidePage = () => {
    return (
        <ScrollView style={{ padding: 16, }}>
            <Text style={styles.heading}>Tremor Guard</Text>
            <Text style={{fontSize: 20, margin: 10}}>
                1. Click on My Home Tab
            </Text>
            <Text style={{fontSize: 20, margin: 10}}>
                2. If Bluetooth and Location are off, it will ask for the permission to start them.
            </Text>
            <Text style={{fontSize: 20, margin: 10}}>
                3. Select the bluetooth device from the list after scan.
            </Text>
            <Text style={{fontSize: 20, margin: 10}}>
                4. Move to Control page of the application and select the buttons to control the application.
            </Text>
        </ScrollView>
    )
}

const styles = StyleSheet.create({
    container: {
        padding: 16,
    },
    heading: {
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 16,
        textDecorationLine:'underline'
    },
    // Add more styles as needed for other components
});


export default GuidePage
