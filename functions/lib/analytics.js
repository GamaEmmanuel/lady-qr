"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAnalytics = void 0;
const https_1 = require("firebase-functions/v2/https");
const index_1 = require("./index");
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
        // Verify user owns this QR code (from main-database)
        const db = (0, index_1.getMainDatabase)();
        let qrDoc = await db.collection('qrcodes').doc(qrCodeId).get();
        // If not found by direct document ID, try locating by shortUrlId
        if (!qrDoc.exists) {
            const altQuery = await db
                .collection('qrcodes')
                .where('shortUrlId', '==', qrCodeId)
                .limit(1)
                .get();
            if (!altQuery.empty) {
                qrDoc = altQuery.docs[0];
            }
        }
        if (!qrDoc.exists) {
            res.status(404).json({ error: 'QR code not found' });
            return;
        }
        const qrData = qrDoc.data();
        if ((qrData === null || qrData === void 0 ? void 0 : qrData.userId) !== userId) {
            res.status(403).json({ error: 'Access denied' });
            return;
        }
        // Get scan analytics without requiring composite index
        const scansQuery = await db
            .collection('scans')
            .where('qrCodeId', '==', qrDoc.id)
            // Intentionally avoid orderBy to prevent index requirement
            .get();
        const scans = scansQuery.docs.map(doc => {
            var _a, _b, _c;
            return (Object.assign(Object.assign({ id: doc.id }, doc.data()), { scannedAt: ((_c = (_b = (_a = doc.data().scannedAt) === null || _a === void 0 ? void 0 : _a.toDate) === null || _b === void 0 ? void 0 : _b.call(_a)) === null || _c === void 0 ? void 0 : _c.toISOString()) || null }));
        });
        // Sort by scannedAt desc in memory and cap to 1000
        const sortedScans = scans
            .slice()
            .sort((a, b) => {
            const aTs = a.scannedAt ? Date.parse(a.scannedAt) : 0;
            const bTs = b.scannedAt ? Date.parse(b.scannedAt) : 0;
            return bTs - aTs;
        })
            .slice(0, 1000);
        // Enrich recent scans with defaults expected by frontend
        const enrichedRecentScans = sortedScans.slice(0, 50).map((scan) => {
            var _a, _b, _c, _d, _e, _f, _g, _h, _j;
            return (Object.assign(Object.assign({}, scan), { location: {
                    country: ((_a = scan.location) === null || _a === void 0 ? void 0 : _a.country) || 'Unknown',
                    city: ((_b = scan.location) === null || _b === void 0 ? void 0 : _b.city) || 'Unknown',
                    region: ((_c = scan.location) === null || _c === void 0 ? void 0 : _c.region) || '',
                    lat: (_d = scan.location) === null || _d === void 0 ? void 0 : _d.lat,
                    lng: (_e = scan.location) === null || _e === void 0 ? void 0 : _e.lng,
                }, deviceInfo: {
                    type: ((_f = scan.deviceInfo) === null || _f === void 0 ? void 0 : _f.type) || 'unknown',
                    os: ((_g = scan.deviceInfo) === null || _g === void 0 ? void 0 : _g.os) || 'unknown',
                    browser: ((_h = scan.deviceInfo) === null || _h === void 0 ? void 0 : _h.browser) || 'unknown',
                    version: ((_j = scan.deviceInfo) === null || _j === void 0 ? void 0 : _j.version) || '',
                } }));
        });
        // Calculate basic analytics
        const totalScans = scans.length;
        // Unique scans by IP as a simple heuristic
        const uniqueIPs = new Set(scans.map((scan) => scan.ipAddress)).size;
        // Aggregate country stats
        const countryStats = enrichedRecentScans.reduce((acc, scan) => {
            var _a;
            const country = ((_a = scan.location) === null || _a === void 0 ? void 0 : _a.country) || 'Unknown';
            acc[country] = (acc[country] || 0) + 1;
            return acc;
        }, {});
        // Aggregate device stats by type
        const deviceStats = enrichedRecentScans.reduce((acc, scan) => {
            var _a;
            const type = ((_a = scan.deviceInfo) === null || _a === void 0 ? void 0 : _a.type) || 'unknown';
            acc[type] = (acc[type] || 0) + 1;
            return acc;
        }, {});
        // Aggregate date stats (YYYY-MM-DD)
        const dateStats = scans.reduce((acc, scan) => {
            if (!scan.scannedAt)
                return acc;
            const dateKey = new Date(scan.scannedAt).toISOString().slice(0, 10);
            acc[dateKey] = (acc[dateKey] || 0) + 1;
            return acc;
        }, {});
        const analytics = {
            totalScans,
            uniqueScans: uniqueIPs,
            recentScans: enrichedRecentScans,
            countryStats,
            deviceStats,
            dateStats,
            lastScannedAt: ((_a = sortedScans[0]) === null || _a === void 0 ? void 0 : _a.scannedAt) || null
        };
        res.json(analytics);
    }
    catch (error) {
        console.error('Analytics error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
//# sourceMappingURL=analytics.js.map