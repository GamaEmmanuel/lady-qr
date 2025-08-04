"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.redirect = void 0;
const https_1 = require("firebase-functions/v2/https");
const admin = __importStar(require("firebase-admin"));
exports.redirect = (0, https_1.onRequest)(async (req, res) => {
    try {
        // Enable CORS
        res.set('Access-Control-Allow-Origin', '*');
        res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
        res.set('Access-Control-Allow-Headers', 'Content-Type');
        if (req.method === 'OPTIONS') {
            res.status(200).send();
            return;
        }
        // Extract short ID from path
        const pathParts = req.path.split('/');
        const shortId = pathParts[pathParts.length - 1];
        if (!shortId) {
            res.status(400).send('Invalid QR code URL');
            return;
        }
        console.log('Processing redirect for shortId:', shortId);
        // Get QR code data
        const qrQuery = await admin.firestore()
            .collection('qrcodes')
            .where('shortUrlId', '==', shortId)
            .limit(1)
            .get();
        if (qrQuery.empty) {
            console.log('QR code not found for shortId:', shortId);
            res.status(404).send('QR Code not found');
            return;
        }
        const qrDoc = qrQuery.docs[0];
        const qrData = qrDoc.data();
        console.log('Found QR code:', qrDoc.id);
        // Check if QR code is active
        if (!qrData.isActive) {
            res.status(410).send('QR Code is inactive');
            return;
        }
        // Log basic scan data
        const userAgent = req.get('User-Agent') || '';
        const ip = req.ip || req.get('x-forwarded-for') || req.get('x-real-ip') || '';
        // Create simple scan record
        const scanData = {
            qrCodeId: qrDoc.id,
            scannedAt: admin.firestore.FieldValue.serverTimestamp(),
            ipAddress: ip,
            userAgent: userAgent,
            referrer: req.get('Referer') || null
        };
        // Log the scan and update scan count
        await Promise.allSettled([
            admin.firestore().collection('scans').add(scanData),
            qrDoc.ref.update({
                scanCount: admin.firestore.FieldValue.increment(1),
                lastScannedAt: admin.firestore.FieldValue.serverTimestamp(),
                updatedAt: admin.firestore.FieldValue.serverTimestamp()
            })
        ]);
        console.log('Redirecting to:', qrData.destinationUrl);
        // Redirect to destination
        res.redirect(302, qrData.destinationUrl);
    }
    catch (error) {
        console.error('Redirect error:', error);
        res.status(500).send('Internal server error');
    }
});
//# sourceMappingURL=redirect.js.map