// Improved Barcode Scanner Implementation
import React, { useState, useEffect, useRef } from 'react';
import { BarCodeScanner } from 'expo-barcode-scanner';

const Scanner = () => {
    const [hasPermission, setHasPermission] = useState(null);
    const [scannedData, setScannedData] = useState([]);
    const [isScanning, setIsScanning] = useState(false);
    const scanAreaRef = useRef(null);

    useEffect(() => {
        (async () => {
            const { status } = await BarCodeScanner.requestPermissionsAsync();
            setHasPermission(status === 'granted');
        })();
    }, []);

    const debounceScan = useRef(null);

    const handleBarCodeScanned = ({ type, data }) => {
        if (isScanning) {
            // Prevent scanning if isScanning is true
            return;
        }

        if (scannedData.includes(data)) {
            // Duplicate detection
            console.warn('Duplicate barcode scanned:', data);
            return;
        }

        setIsScanning(true);
        setScannedData((prevData) => [...prevData, data]);

        clearTimeout(debounceScan.current);
        debounceScan.current = setTimeout(() => {
            console.log(`Bar code with type ${type} and data ${data} has been scanned!`);
            setIsScanning(false);
        }, 2000); // Debounce time of 2 seconds
    };

    if (hasPermission === null) {
        return <Text>Requesting for camera permission</Text>;
    }
    if (hasPermission === false) {
        return <Text>No access to camera</Text>;
    }

    return (
        <BarCodeScanner
            onBarCodeScanned={handleBarCodeScanned}
            style={{ height: 400, width: '100%' }}
            ref={scanAreaRef}
        />
    );
};

export default Scanner;