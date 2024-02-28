import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React from "react";
import { Text, View } from "react-native";
import ControlApp from "./ControlApp";
import GuidePage from "./GuidePage";


const GuideStack = createNativeStackNavigator();

const Control = () => {
    
    return (
        <GuideStack.Navigator initialRouteName="HomeApp">
            <GuideStack.Screen name="Guide Page" options={{ headerTitleAlign: 'center' }} component={GuidePage} />
        </GuideStack.Navigator>
    )
}

export default Control;
