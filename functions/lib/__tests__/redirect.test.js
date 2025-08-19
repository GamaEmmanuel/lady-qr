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
const admin = __importStar(require("firebase-admin"));
const redirect_1 = require("../redirect");
// Mock Firebase Admin
jest.mock('firebase-admin', () => ({
    firestore: jest.fn(() => ({
        collection: jest.fn(),
        doc: jest.fn()
    })),
    FieldValue: {
        serverTimestamp: jest.fn(() => 'TIMESTAMP'),
        increment: jest.fn((val) => `INCREMENT(${val})`)
    }
}));
// Mock Firebase Functions
const mockResponse = {
    set: jest.fn(),
    status: jest.fn().mockReturnThis(),
    send: jest.fn().mockReturnThis(),
    redirect: jest.fn()
};
const mockRequest = {
    method: 'GET',
    path: '/r/test-short-id',
    get: jest.fn(),
    ip: '192.168.1.1'
};
describe('Redirect Function - Unified QR System', () => {
    let mockFirestore;
    let mockCollection;
    let mockDoc;
    let mockQuery;
    beforeEach(() => {
        jest.clearAllMocks();
        // Setup Firestore mocks
        mockQuery = {
            limit: jest.fn().mockReturnThis(),
            get: jest.fn()
        };
        mockDoc = {
            get: jest.fn(),
            ref: {
                update: jest.fn()
            },
            id: 'test-qr-id',
            data: jest.fn(),
            exists: true
        };
        mockCollection = {
            where: jest.fn().mockReturnValue(mockQuery),
            doc: jest.fn().mockReturnValue(mockDoc),
            add: jest.fn()
        };
        mockFirestore = {
            collection: jest.fn().mockReturnValue(mockCollection)
        };
        admin.firestore = jest.fn().mockReturnValue(mockFirestore);
        // Setup request mocks
        mockRequest.get = jest.fn((header) => {
            const headers = {
                'User-Agent': 'Test Browser',
                'Referer': 'https://test-referrer.com'
            };
            return headers[header] || null;
        });
    });
    describe('QR Code Lookup', () => {
        it('should find QR code by shortUrlId', async () => {
            const mockQRData = {
                id: 'test-qr-id',
                type: 'url',
                isActive: true,
                destinationUrl: 'https://example.com',
                scanCount: 5
            };
            mockQuery.get.mockResolvedValue({
                empty: false,
                docs: [Object.assign(Object.assign({}, mockDoc), { data: () => mockQRData })]
            });
            await (0, redirect_1.redirect)(mockRequest, mockResponse);
            expect(mockCollection.where).toHaveBeenCalledWith('shortUrlId', '==', 'test-short-id');
            expect(mockResponse.redirect).toHaveBeenCalledWith(302, 'https://example.com');
        });
        it('should find QR code by direct ID when shortUrlId lookup fails', async () => {
            const mockQRData = {
                id: 'test-short-id',
                type: 'email',
                isActive: true,
                destinationUrl: 'mailto:test@example.com',
                scanCount: 3
            };
            // First query (by shortUrlId) returns empty
            mockQuery.get.mockResolvedValue({ empty: true, docs: [] });
            // Second query (by direct ID) returns the document
            mockDoc.get.mockResolvedValue({
                exists: true,
                data: () => mockQRData,
                id: 'test-short-id',
                ref: { update: jest.fn() }
            });
            await (0, redirect_1.redirect)(mockRequest, mockResponse);
            expect(mockCollection.doc).toHaveBeenCalledWith('test-short-id');
            expect(mockResponse.redirect).toHaveBeenCalledWith(302, 'mailto:test@example.com');
        });
        it('should return 404 when QR code is not found', async () => {
            mockQuery.get.mockResolvedValue({ empty: true, docs: [] });
            mockDoc.get.mockResolvedValue({ exists: false });
            await (0, redirect_1.redirect)(mockRequest, mockResponse);
            expect(mockResponse.status).toHaveBeenCalledWith(404);
            expect(mockResponse.send).toHaveBeenCalledWith('QR Code not found');
        });
    });
    describe('QR Code Status Validation', () => {
        it('should return 410 for inactive QR codes', async () => {
            const mockQRData = {
                id: 'test-qr-id',
                type: 'url',
                isActive: false,
                destinationUrl: 'https://example.com'
            };
            mockQuery.get.mockResolvedValue({
                empty: false,
                docs: [Object.assign(Object.assign({}, mockDoc), { data: () => mockQRData })]
            });
            await (0, redirect_1.redirect)(mockRequest, mockResponse);
            expect(mockResponse.status).toHaveBeenCalledWith(410);
            expect(mockResponse.send).toHaveBeenCalledWith('QR Code is inactive');
        });
        it('should handle missing QR data', async () => {
            mockQuery.get.mockResolvedValue({
                empty: false,
                docs: [Object.assign(Object.assign({}, mockDoc), { data: () => null })]
            });
            await (0, redirect_1.redirect)(mockRequest, mockResponse);
            expect(mockResponse.status).toHaveBeenCalledWith(404);
            expect(mockResponse.send).toHaveBeenCalledWith('QR Code data not found');
        });
    });
    describe('Analytics Tracking', () => {
        it('should track scan data for all QR code types', async () => {
            const mockQRData = {
                id: 'test-qr-id',
                type: 'url',
                isActive: true,
                destinationUrl: 'https://example.com',
                scanCount: 5
            };
            mockQuery.get.mockResolvedValue({
                empty: false,
                docs: [Object.assign(Object.assign({}, mockDoc), { data: () => mockQRData })]
            });
            await (0, redirect_1.redirect)(mockRequest, mockResponse);
            // Check that scan data was recorded
            expect(mockCollection.add).toHaveBeenCalledWith({
                qrCodeId: 'test-qr-id',
                scannedAt: 'TIMESTAMP',
                ipAddress: '192.168.1.1',
                userAgent: 'Test Browser',
                referrer: 'https://test-referrer.com'
            });
            // Check that QR code stats were updated
            expect(mockDoc.ref.update).toHaveBeenCalledWith({
                scanCount: 'INCREMENT(1)',
                lastScannedAt: 'TIMESTAMP',
                updatedAt: 'TIMESTAMP'
            });
        });
        it('should handle missing request headers gracefully', async () => {
            const mockQRData = {
                id: 'test-qr-id',
                type: 'text',
                isActive: true,
                destinationUrl: 'data:text/plain;charset=utf-8,Hello%20World'
            };
            mockQuery.get.mockResolvedValue({
                empty: false,
                docs: [Object.assign(Object.assign({}, mockDoc), { data: () => mockQRData })]
            });
            // Mock request with missing headers
            const requestWithMissingHeaders = Object.assign(Object.assign({}, mockRequest), { get: jest.fn().mockReturnValue(null), ip: undefined });
            await (0, redirect_1.redirect)(requestWithMissingHeaders, mockResponse);
            expect(mockCollection.add).toHaveBeenCalledWith({
                qrCodeId: 'test-qr-id',
                scannedAt: 'TIMESTAMP',
                ipAddress: '',
                userAgent: '',
                referrer: null
            });
        });
    });
    describe('Destination URL Generation', () => {
        it('should use stored destinationUrl when available', async () => {
            const mockQRData = {
                id: 'test-qr-id',
                type: 'url',
                isActive: true,
                destinationUrl: 'https://stored-destination.com',
                content: { url: 'https://different-url.com' }
            };
            mockQuery.get.mockResolvedValue({
                empty: false,
                docs: [Object.assign(Object.assign({}, mockDoc), { data: () => mockQRData })]
            });
            await (0, redirect_1.redirect)(mockRequest, mockResponse);
            expect(mockResponse.redirect).toHaveBeenCalledWith(302, 'https://stored-destination.com');
        });
        it('should generate destinationUrl from content for legacy QR codes', async () => {
            const mockQRData = {
                id: 'test-qr-id',
                type: 'email',
                isActive: true,
                destinationUrl: null,
                content: {
                    email: 'test@example.com',
                    subject: 'Test Subject',
                    body: 'Test Body'
                }
            };
            mockQuery.get.mockResolvedValue({
                empty: false,
                docs: [Object.assign(Object.assign({}, mockDoc), { data: () => mockQRData })]
            });
            await (0, redirect_1.redirect)(mockRequest, mockResponse);
            expect(mockResponse.redirect).toHaveBeenCalledWith(302, 'mailto:test@example.com?subject=Test%20Subject&body=Test%20Body');
        });
        it('should handle different QR code types correctly', async () => {
            const testCases = [
                {
                    type: 'url',
                    content: { url: 'https://example.com' },
                    expected: 'https://example.com'
                },
                {
                    type: 'sms',
                    content: { phone: '+1234567890', message: 'Hello' },
                    expected: 'sms:+1234567890?body=Hello'
                },
                {
                    type: 'wifi',
                    content: { encryption: 'WPA2', ssid: 'MyWiFi', password: 'secret123' },
                    expected: 'WIFI:T:WPA2;S:MyWiFi;P:secret123;;'
                },
                {
                    type: 'location',
                    content: { latitude: '40.7128', longitude: '-74.0060' },
                    expected: 'geo:40.7128,-74.0060'
                }
            ];
            for (const testCase of testCases) {
                jest.clearAllMocks();
                const mockQRData = {
                    id: 'test-qr-id',
                    type: testCase.type,
                    isActive: true,
                    destinationUrl: null,
                    content: testCase.content
                };
                mockQuery.get.mockResolvedValue({
                    empty: false,
                    docs: [Object.assign(Object.assign({}, mockDoc), { data: () => mockQRData })]
                });
                await (0, redirect_1.redirect)(mockRequest, mockResponse);
                expect(mockResponse.redirect).toHaveBeenCalledWith(302, testCase.expected);
            }
        });
        it('should return 500 when no destination URL can be determined', async () => {
            const mockQRData = {
                id: 'test-qr-id',
                type: 'url',
                isActive: true,
                destinationUrl: null,
                content: null
            };
            mockQuery.get.mockResolvedValue({
                empty: false,
                docs: [Object.assign(Object.assign({}, mockDoc), { data: () => mockQRData })]
            });
            await (0, redirect_1.redirect)(mockRequest, mockResponse);
            expect(mockResponse.status).toHaveBeenCalledWith(500);
            expect(mockResponse.send).toHaveBeenCalledWith('QR Code destination not configured');
        });
    });
    describe('Error Handling', () => {
        it('should handle CORS preflight requests', async () => {
            const optionsRequest = Object.assign(Object.assign({}, mockRequest), { method: 'OPTIONS' });
            await (0, redirect_1.redirect)(optionsRequest, mockResponse);
            expect(mockResponse.set).toHaveBeenCalledWith('Access-Control-Allow-Origin', '*');
            expect(mockResponse.set).toHaveBeenCalledWith('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
            expect(mockResponse.set).toHaveBeenCalledWith('Access-Control-Allow-Headers', 'Content-Type');
            expect(mockResponse.status).toHaveBeenCalledWith(200);
            expect(mockResponse.send).toHaveBeenCalled();
        });
        it('should handle invalid short ID', async () => {
            const invalidRequest = Object.assign(Object.assign({}, mockRequest), { path: '/r/' });
            await (0, redirect_1.redirect)(invalidRequest, mockResponse);
            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(mockResponse.send).toHaveBeenCalledWith('Invalid QR code URL');
        });
        it('should handle database errors gracefully', async () => {
            mockQuery.get.mockRejectedValue(new Error('Database connection failed'));
            await (0, redirect_1.redirect)(mockRequest, mockResponse);
            expect(mockResponse.status).toHaveBeenCalledWith(500);
            expect(mockResponse.send).toHaveBeenCalledWith('Internal server error');
        });
        it('should continue redirect even if analytics tracking fails', async () => {
            const mockQRData = {
                id: 'test-qr-id',
                type: 'url',
                isActive: true,
                destinationUrl: 'https://example.com'
            };
            mockQuery.get.mockResolvedValue({
                empty: false,
                docs: [Object.assign(Object.assign({}, mockDoc), { data: () => mockQRData })]
            });
            // Make analytics tracking fail
            mockCollection.add.mockRejectedValue(new Error('Analytics failed'));
            mockDoc.ref.update.mockRejectedValue(new Error('Update failed'));
            await (0, redirect_1.redirect)(mockRequest, mockResponse);
            // Should still redirect despite analytics failures
            expect(mockResponse.redirect).toHaveBeenCalledWith(302, 'https://example.com');
        });
    });
});
//# sourceMappingURL=redirect.test.js.map