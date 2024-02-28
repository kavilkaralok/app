import React, { useEffect, useState } from "react"
import { Alert, Dimensions, FlatList, Image, PermissionsAndroid, Platform, Text, ToastAndroid, TouchableHighlight, TouchableOpacity, View } from "react-native"
import BleManager, { BleDisconnectPeripheralEvent, BleScanCallbackType, BleScanMatchMode, BleScanMode, Peripheral } from 'react-native-ble-manager'
import { NativeEventEmitter, NativeModules } from "react-native";
import { isLocationEnabled, promptForEnableLocationIfNeeded } from "react-native-android-location-enabler";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useIsFocused } from "@react-navigation/native";
const { width, height } = Dimensions.get('window');

const BleManagerModule = NativeModules.BleManager;
const bleManagerEmitter = new NativeEventEmitter(BleManagerModule);


const HomeApp = () => {

    // defining the state variables.
    const [isPair, setPair] = useState(false);
    const [BleLoc, setBleLoc] = useState(false);
    const [name, setName] = useState("");
    const [Id, setId] = useState("");
    const isFocused = useIsFocused();

    const [peripherals1, setPeripherals] = React.useState(
        new Map<Peripheral['id'], Peripheral>(),
    );

    const addOrUpdatePeripheral = (id: string, updatedPeripheral: Peripheral) => {
        setPeripherals(map => new Map(map.set(id, updatedPeripheral)));
    }




    useEffect(() => {
        BleManager.start({ showAlert: false });
        handlePermission();
        enableBLE();
        const ble1 = bleManagerEmitter.addListener('BleManagerDiscoverPeripheral', handleDiscoverPeripheral);
        console.log(Platform.Version);

        const fetchAsyncData = async () => {
            try {
                const val = await AsyncStorage.getItem('@app:id');
                console.log('Value is ', val);

                const valName = await AsyncStorage.getItem("@app:name");
                console.log("Name is " + name);

                if (valName) setName(valName);
                if (val) setId(val);

                const paired = await AsyncStorage.getItem("@app:paired");

                if (paired !== null && paired === "false") {
                    setPair(false)
                }

                if (val !== 'null' && val !== null && name !== "null") {
                    console.log(val);
                    console.log('Navigating Bro.....');
                    setPair(true);
                }
            } catch (error) {
                console.error('Error fetching data: ', error);
            }
        }

        fetchAsyncData();


        return () => {
            ble1.remove();
        }

    }, [isFocused]);





    const enableBLE = async () => {
        console.log("Ble is starting the connection.");
        try {
            await BleManager.enableBluetooth();
            console.log("Bluetooth enabled");
            setBleLoc(true);
            const checkEnabled: boolean = await isLocationEnabled();
            console.log("checkEnabled" + checkEnabled);
            if (checkEnabled === false) {
                await promptForEnableLocationIfNeeded().then((val) => {
                    console.log("Location enabled.");
                    setBleLoc(true);
                })
                    .catch((err) => {
                        console.log("Failed to to so...." + err);
                        setBleLoc(false);
                    })
            }
        }
        catch (error) {
            console.log("Error enabling bluetotth");
            Alert.alert(
                'Bluetooth permission required',
                'Please enable Bluetooth permission',
                [{ text: "Ok", onPress: () => console.log("Ok Pressed") }]
            )
        }

    }
    const startScan = () => {
        console.log(BleManager.checkState().then((state) => {
            console.log(state);
        }))
        setPeripherals(new Map<Peripheral['id'], Peripheral>());
        try {
            console.log("Scanning started");
            BleManager.scan([], 5, true, { matchMode: BleScanMatchMode.Sticky, scanMode: BleScanMode.LowLatency, callbackType: BleScanCallbackType.AllMatches })
                .then(() => {
                    console.log("Scanning succesfull");
                    // console.log(serivce_uid);
                })
                .catch((err) => {
                    console.log("Got erro while scanning.." + err);
                })
        }
        catch (error) {
            console.log("Scanning cannot be performed..." + error);
        }
    }

    const handleDiscoverPeripheral = async (peripheral: Peripheral) => {
        console.debug('[handleDiscoverPeripheral] new BLE peripheral= ', peripheral.name);

        if (!peripheral) {
            console.log("Please check with the location");
        }

        if (!peripheral.name) {
            peripheral.name = 'No Name';
        }
        else {
            // console.log("Peripherals" + peripheral.name);
            addOrUpdatePeripheral(peripheral.id, peripheral);
        }
    }

    const handlePermission = () => {
        if (Platform.OS === 'android' && Platform.Version >= 31) {
            PermissionsAndroid.requestMultiple(
                [
                    PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
                    PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
                ]
            )
                .then(val => {
                    if (val) {
                        console.debug("Permission for android 12+ accepted.");
                    } else {
                        console.log("Permission denied by the user.");
                    }
                })
        }
        else if (Platform.OS == 'android' && Platform.Version >= 23) {
            PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,)
                .then((val) => {
                    if (val) {
                        console.log("User accepted permission");
                    }
                    else {
                        console.log("user denied the permission");
                    }
                })
        }

    }

    const disconnect = (peripheral: string) => {

        BleManager.disconnect(peripheral).then((val) => {
            console.log("Disconnected");
            ToastAndroid.show("Disconnected... Ready to Pair.", ToastAndroid.SHORT);
        })
            .catch((err) => {
                console.log(err);
            })
    }

    return (isPair === false) ?
        <View style={{ marginTop: "10%", alignItems: 'center' }}>

            <TouchableOpacity
                style={{ alignContent: 'center', width: '50%', backgroundColor: '#3498db', margin: 20, padding: 20, borderRadius: 20, elevation: 5, }}
                onPress={startScan}
            >
                <Text style={{ color: "black", fontSize: 20, textAlign: 'center' }}>Scan</Text>
            </TouchableOpacity>

            <FlatList style={{ width: '90%' }}
                data={Array.from(peripherals1.values())}
                contentContainerStyle={{ rowGap: 12 }}
                keyExtractor={item => item.id}
                renderItem={item => (
                    <TouchableHighlight
                        style={{ backgroundColor: 'lightgrey', borderRadius: 20 }}
                        underlayColor="#1f618d"
                        onPress={() => {

                            if (item.item.id) {
                                console.log("Data stored finally");
                                AsyncStorage.setItem("@app:id", item.item.id);
                            }

                            if (item.item.name) {
                                console.log("Name stored");
                                console.log(item.item.name);
                                AsyncStorage.setItem("@app:name", item.item.name);
                                setPair(true)
                                setName(item.item.name);
                                AsyncStorage.setItem("@app:paired", "true");
                            }

                        }}>
                        <View style={{ padding: 20 }}>
                            <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'space-between' }}>
                                <Text style={{ fontSize: 20, fontWeight: 'bold'}}>{item.item.advertising?.localName}</Text>
                                <Text style={{ fontSize: 20 }}>{item.item.rssi}</Text>
                            </View>
                            <Text style={{ fontSize: 15 }}>{item.item.id}</Text>
                        </View>
                    </TouchableHighlight>
                )}
            />
        </View>
        :
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor:'transparent'}}>
            <View style={{
                width: width * 0.8, 
            }}>
                <Image style={{
                    width: width * 0.8, 
                    height: height * 0.3, 
                    resizeMode: 'contain'
                }} source={require('./images/89361.jpg')} />
            </View>
            <Text style={{fontSize: 20, fontWeight:'bold', margin: '5%'}}>{name}</Text>
            <TouchableOpacity style={{
                width: "50%",
                margin: 20, padding: '5%', borderRadius: 4,
                elevation: 9,
                backgroundColor: 'black',
                alignItems: 'center'
            }}
                onPress={() => {
                    setPair(false);
                    setName("");
                    disconnect(Id);
                    setId("");
                    AsyncStorage.setItem("@app:id", "null");
                    AsyncStorage.setItem("@app:name", "null");
                    AsyncStorage.setItem("@app:paired", "false")
                }}
            >
                <Text style={{ color: 'white', fontSize: 20 }}>Unpair</Text>
            </TouchableOpacity>
        </View>
}

export default HomeApp;