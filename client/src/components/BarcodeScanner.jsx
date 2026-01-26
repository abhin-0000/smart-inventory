import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { X, Camera, Package } from 'lucide-react';

const BarcodeScanner = ({ onScan, onClose }) => {
    const [scanning, setScanning] = useState(false);
    const [error, setError] = useState('');
    const scannerRef = useRef(null);
    const html5QrCodeRef = useRef(null);

    useEffect(() => {
        startScanner();
        return () => {
            stopScanner();
        };
    }, []);

    const startScanner = async () => {
        try {
            html5QrCodeRef.current = new Html5Qrcode("barcode-reader");

            await html5QrCodeRef.current.start(
                { facingMode: "environment" },
                {
                    fps: 10,
                    qrbox: { width: 250, height: 150 }
                },
                (decodedText) => {
                    // Barcode scanned successfully
                    onScan(decodedText);
                    stopScanner();
                },
                (errorMessage) => {
                    // Ignore scan errors (happens continuously while scanning)
                }
            );
            setScanning(true);
        } catch (err) {
            console.error("Scanner error:", err);
            setError("Could not access camera. Please allow camera permissions.");
        }
    };

    const stopScanner = async () => {
        if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
            try {
                await html5QrCodeRef.current.stop();
            } catch (e) {
                console.error("Stop scanner error:", e);
            }
        }
    };

    const handleManualEntry = () => {
        const sku = prompt("Enter SKU manually:");
        if (sku) {
            onScan(sku);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '400px' }}>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg">Scan Barcode</h2>
                    <button onClick={onClose} className="text-muted">
                        <X size={20} />
                    </button>
                </div>

                {error ? (
                    <div className="text-center py-8">
                        <Camera size={40} className="mx-auto text-gray-300 mb-4" />
                        <p className="text-danger text-sm mb-4">{error}</p>
                        <button className="btn btn-primary" onClick={handleManualEntry}>
                            <Package size={16} />
                            Enter SKU Manually
                        </button>
                    </div>
                ) : (
                    <>
                        <div id="barcode-reader" className="barcode-reader" ref={scannerRef}></div>
                        <p className="text-xs text-muted text-center mt-4">
                            Position the barcode within the box to scan
                        </p>
                        <button
                            className="btn w-full mt-4"
                            style={{ background: '#f1f5f9' }}
                            onClick={handleManualEntry}
                        >
                            Or enter SKU manually
                        </button>
                    </>
                )}
            </div>
        </div>
    );
};

export default BarcodeScanner;
