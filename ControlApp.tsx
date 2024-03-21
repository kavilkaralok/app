import AsyncStorage from "@react-native-async-storage/async-storage";
import { useIsFocused } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import { Text, ToastAndroid, TouchableOpacity, View } from "react-native";
import BleManager, { BleDisconnectPeripheralEvent, BleScanCallbackType, BleScanMatchMode, BleScanMode, Peripheral } from 'react-native-ble-manager'
import { NativeEventEmitter, NativeModules } from "react-native";
import { isLocationEnabled, promptForEnableLocationIfNeeded } from "react-native-android-location-enabler";

const BleManagerModule = NativeModules.BleManager;
const bleManagerEmitter = new NativeEventEmitter(BleManagerModule);

const ControlApp = () => {

    const [connected, setConnected] = useState(false);
    const [paired, setPaired] = useState(false);
    const [name, setName] = useState("");
    const isFocused = useIsFocused();
    console.log(isFocused);
    var s = "";

    useEffect(() => {
        const listeners = [

            bleManagerEmitter.addListener(
                'BleManagerDisconnectPeripheral',
                handleDisconnectedPeripheral,
            ),

            // bleManagerEmitter.addListener(
            //     'BleManagerConnectPeripheral',
            //     handleConnectPeripheral,
            // ),
        ];
        if (isFocused) {
            const fetchData = async () => {
                const val = await AsyncStorage.getItem("@app:id");
                console.log(val);
                const paired = await AsyncStorage.getItem("@app:paired");

                if (paired !== null && paired !== "false") {
                    setPaired(true)
                }
                else {
                    setPaired(false)
                }
                if (val && val !== 'null') {
                    const data = await BleManager.isPeripheralConnected(val);
                    console.log("Device is " + data);
                    setName(val);
                    if (data === false) {
                        connect(val)
                        s += val;
                        console.log(s);
                    }
                    else {
                        setName(val);
                        setConnected(true)
                        console.log("Already connected.")
                    }
                }
            }
            fetchData();
        }
        return () => {
            console.debug('[app] main component unmounting. Removing listeners...');
            for (const listener of listeners) {
                listener.remove();
            }
        };
    }, [isFocused]);



    const handleDisconnectedPeripheral = (
        event: BleDisconnectPeripheralEvent,
    ) => {
        console.debug(
            `[handleDisconnectedPeripheral][${event.peripheral}] disconnected.`,
            setConnected(false)
        );
    };

    const getConnected = async () => {
        try {
            const devices = await BleManager.getConnectedPeripherals();
            console.log("In retrieve function ", devices);
        }
        catch (err) {
            console.log("Unable to get the connected devices..")
        }
    }
    // sleep function
    function sleep(ms: number) {
        return new Promise<void>(resolve => setTimeout(resolve, ms));
    }

    // connect function
    const connect = async (peripheral: string) => {
        try {
            if (peripheral) {
                await BleManager.connect(peripheral);
                setConnected(true);
                console.log('pheripheral connected.');
                ToastAndroid.show("Connected", ToastAndroid.SHORT);

                await sleep(900);

                const data = await BleManager.retrieveServices(peripheral);
                console.log("services: ", data);

                const rssi = await BleManager.readRSSI(peripheral);

                console.log("Rssi : " + rssi);

                if (data.characteristics) {
                    console.log("Present");
                }

                getConnected();

                if (data.characteristics) {
                    for (let characteristic of data.characteristics) {
                        if (characteristic.descriptors) {
                            for (let descriptor of characteristic.descriptors) {
                                try {
                                    let data = await BleManager.readDescriptor(
                                        peripheral,
                                        characteristic.service, characteristic.characteristic,
                                        descriptor.uuid
                                    );
                                    console.log("per", peripheral, " read as", data);
                                }
                                catch (err) {
                                    console.log("Don't able to get the data");
                                }
                            }
                        }
                    }
                }
            }
        }
        catch (err) {
            ToastAndroid.show("Disconnected check bluetooth connection", ToastAndroid.SHORT);
            console.log("Error occur..." + err);
        }
    }

    const senddata = (num: Number) => {

        var data: number[] = [];
        switch (num) {
            case 1:
                data = [1];
                break;

            case 2:
                data = [2];
                break;

            case 3:
                data = [3];
                break;

            case 4:
                data = [4];
                break;
            case 5:
                data = [5];
                break;
            case 6:
                data = [6];
                break;
            case 7:
                data = [7];
                break;

            case 8:
                data = [8];
                break;

            case 9:
                data = [9];
                break;

            default:
                break;
        }

        BleManager.write(name, "ffe0", "ffe1", data)
            .then(() => {
                console.log("Data sended");
            })
            .catch((err) => {
                console.log("Error: ", err);
            })
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

    return (
        <View>
            {
                (paired) ?

                    (connected) ?
                        <View style={{ alignItems: 'center' }}>
                            <View style={{ marginTop: '5%', marginBottom: "10%" }}>
                                <Text style={{ fontSize: 25, fontWeight: 'bold', color:'black'}}>Connected</Text>
                            </View>


                            <View style={{ display: 'flex', flexDirection: 'row' }}>
                                <TouchableOpacity
                                    style={{ width: '45%', backgroundColor: '#007bff', margin: 10, padding: 15, borderRadius: 20 }}
                                    onPress={() => { senddata(1) }}
                                >
                                    <Text style={{ color: "white", fontSize: 20, textAlign: 'center', fontFamily: 'Arial', }}>1</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={{ width: '45%', backgroundColor: '#007bff', margin: 10, padding: 15, borderRadius: 20 }}
                                    onPress={() => { senddata(4) }}
                                >
                                    <Text style={{ color: "white", fontSize: 20, textAlign: 'center', fontFamily: 'Arial', }}>2</Text>
                                </TouchableOpacity>
                            </View>

                            <View style={{ display: 'flex', flexDirection: 'row' }}>
                                <TouchableOpacity
                                    style={{ width: '45%', backgroundColor: '#007bff', margin: 10, padding: 15, borderRadius: 20 }}
                                    onPress={() => { senddata(5) }}
                                >
                                    <Text style={{ color: "white", fontSize: 20, textAlign: 'center', fontFamily: 'Arial', }}>A</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={{ width: '45%', backgroundColor: '#007bff', margin: 10, padding: 15, borderRadius: 20, elevation: 10 }}
                                    onPress={() => { senddata(6) }}
                                >
                                    <Text style={{ color: "white", fontSize: 20, textAlign: 'center', fontFamily: 'Arial', }}>B</Text>
                                </TouchableOpacity>
                            </View>

                            <View style={{ display: 'flex', flexDirection: 'row' }}>
                                <TouchableOpacity
                                    style={{ width: '45%', backgroundColor: '#007bff', margin: 10, padding: 15, borderRadius: 20 }}
                                    onPress={() => { senddata(7) }}
                                >
                                    <Text style={{ color: "white", fontSize: 20, textAlign: 'center', fontFamily: 'Arial', }}>C</Text>
                                </TouchableOpacity>
                            </View>
                            <View style={{ display: 'flex', flexDirection: 'row' }}>
                                <TouchableOpacity
                                    style={{ width: '45%', backgroundColor: '#007bff', margin: 10, padding: 15, borderRadius: 20 }}
                                    onPress={() => { senddata(9) }}
                                >
                                    <Text style={{ color: "white", fontSize: 20, textAlign: 'center', fontFamily: 'Arial', }}>Mute</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={{ width: '45%', backgroundColor: '#007bff', margin: 10, padding: 15, borderRadius: 20 }}
                                    onPress={() => { senddata(8) }}
                                >
                                    <Text style={{ color: "white", fontSize: 20, textAlign: 'center', fontFamily: 'Arial', }}>Scan</Text>
                                </TouchableOpacity>
                            </View>

                            <TouchableOpacity
                                style={{ width: '90%', backgroundColor: '#dc3545', margin: 10, padding: 15, borderRadius: 20, elevation: 10 }}
                                onPress={() => {
                                    disconnect(name);
                                    setPaired(false)
                                    setName("");
                                    AsyncStorage.setItem("@app:id", "null");
                                    AsyncStorage.setItem("@app:name", "null");
                                    AsyncStorage.setItem("@app:paired", "false")
                                }}
                            >
                                <Text style={{ color: "white", fontSize: 20, textAlign: 'center', fontFamily: 'Arial', }}>Disconnect</Text>
                            </TouchableOpacity>

                        </View>
                        :
                        <View style={{ alignItems: 'center' }}>
                            <View style={{ margin: '20%' }}>
                                <Text style={{ fontSize: 25 }}>Disconnected.</Text>
                            </View>
                        </View>
                    :
                    <View style={{ alignItems: 'center' }}>
                        <View style={{ margin: '20%' }}>
                            <Text style={{ fontSize: 20, fontWeight: 'bold' }}>Please pair the device.</Text>
                        </View>
                    </View>
            }
        </View>
    )
}

export default ControlApp;