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
exports.getAnalytics = void 0;
const https_1 = require("firebase-functions/v2/https");
const admin = __importStar(require("firebase-admin"));
exports.getAnalytics = (0, https_1.onRequest)(async (req, res) => {
    var _a;
    try {
        // Enable CORS
        res.set('Access-Control-Allow-Origin', '*');
        res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
        res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
        if (req.method === 'OPTIONS') {
            res.status(200).send();
            return;
        }
        // Get QR code ID from query params
        const qrCodeId = req.query.qrCodeId;
        const userId = req.query.userId;
        if (!qrCodeId || !userId) {
            res.status(400).json({ error: 'Missing qrCodeId or userId' });
            return;
        }
        // Verify user owns this QR code
        const qrDoc = await admin.firestore().collection('qrcodes').doc(qrCodeId).get();
        if (!qrDoc.exists) {
            res.status(404).json({ error: 'QR code not found' });
            return;
        }
        const qrData = qrDoc.data();
        if ((qrData === null || qrData === void 0 ? void 0 : qrData.userId) !== userId) {
            res.status(403).json({ error: 'Access denied' });
            return;
        }
        // Get scan analytics
        const scansQuery = await admin.firestore()
            .collection('scans')
            .where('qrCodeId', '==', qrCodeId)
            .orderBy('scannedAt', 'desc')
            .limit(1000)
            .get();
        const scans = scansQuery.docs.map(doc => {
            var _a, _b, _c;
            return (Object.assign(Object.assign({ id: doc.id }, doc.data()), { scannedAt: ((_c = (_b = (_a = doc.data().scannedAt) === null || _a === void 0 ? void 0 : _a.toDate) === null || _b === void 0 ? void 0 : _b.call(_a)) === null || _c === void 0 ? void 0 : _c.toISOString()) || null }));
        });
        // Calculate basic analytics
        const totalScans = scans.length;
        const uniqueIPs = new Set(scans.map((scan) => scan.ipAddress)).size;
        const analytics = {
            totalScans,
            uniqueScans: uniqueIPs,
            recentScans: scans.slice(0, 50), // Last 50 scans
            lastScannedAt: ((_a = scans[0]) === null || _a === void 0 ? void 0 : _a.scannedAt) || null
        };
        res.json(analytics);
    }
    catch (error) {
        console.error('Analytics error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
//# sourceMappingURL=analytics.js.map