import React from "react";
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Home from "./Home";
import Control from "./Control";
import Guide from "./Guide";
import Icon from 'react-native-vector-icons/Ionicons';


const Tab = createBottomTabNavigator();

const App = ()=>{
  return(
    <NavigationContainer>
    <Tab.Navigator screenOptions={{ headerShown: false}}>
        <Tab.Screen name='My Home'component={Home} options={{
          tabBarIcon: ({ color, size }) => (
            <Icon name="home" color={color} size={size} />
          ),
        }}/>
        <Tab.Screen name="Control" component={Control} options={{
          tabBarIcon: ({ color, size }) => (
            <Icon name="watch-outline" color={color} size={size} />
          ),
        }} />
        <Tab.Screen name="Guide" component={Guide} options={{
          tabBarIcon: ({ color, size }) => (
            <Icon name="help" color={color} size={size} />
          ),
        }}/>
    </Tab.Navigator>
</NavigationContainer>
  )
}

export default App;