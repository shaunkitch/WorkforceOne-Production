import React, { useState, useEffect, useRef } from 'react';
import { RNCamera } from 'react-native-camera';

const Scanner = () => {
    const [barcode, setBarcode] = useState('');
    const [lastScan, setLastScan] = useState(0);
    const [scanArea, setScanArea] = useState({ x: 0, y: 0, width: 300, height: 300 });
    const lastScans = useRef(new Set());

    const handleBarcodeRead = ({ data }) => {
        const currentTime = Date.now();
        if (currentTime - lastScan > 2000) { // 2 seconds debounce
            if (!lastScans.current.has(data)) { // Duplicate detection
                lastScans.current.add(data);
                setBarcode(data);
                console.log(`Barcode scanned: ${data}`);
                setTimeout(() => lastScans.current.delete(data), 5000); // Clear after 5 seconds
            }
            setLastScan(currentTime);
        }
    };

    return (
        <RNCamera
            style={{ width: '100%', height: '100%', borderColor: 'black', borderWidth: 1 }}
            onBarCodeRead={handleBarcodeRead}
            captureAudio={false}
            captureImage={false}
            onFocusChanged={false}
            behavior="maxWidth"
            ratio="16:9"
            {...scanArea}
        />
    );
};

export default Scanner;