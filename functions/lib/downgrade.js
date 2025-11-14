"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.downgradeToPlan = void 0;
const https_1 = require("firebase-functions/v2/https");
const firebase_functions_1 = require("firebase-functions");
const index_1 = require("./index");
/**
 * Cloud function to downgrade a user to the free plan
 * This will:
 * 1. Delete all QR codes except the most recent one
 * 2. Update the user's subscription to free plan
 */
exports.downgradeToPlan = (0, https_1.onCall)(async (request) => {
    firebase_functions_1.logger.info("🔽 downgradeToPlan function triggered");
    // Check if user is authenticated
    if (!request.auth) {
        firebase_functions_1.logger.warn("Unauthenticated user tried to call downgradeToPlan.");
        throw new https_1.HttpsError("unauthenticated", "The function must be called while authenticated.");
    }
    const userId = request.auth.uid;
    const { planId } = request.data;
    firebase_functions_1.logger.info(`User ${userId} is downgrading to plan: ${planId}`);
    if (planId !== 'free') {
        throw new https_1.HttpsError('invalid-argument', 'This function only handles downgrades to free plan.');
    }
    const db = (0, index_1.getMainDatabase)();
    try {
        // Get all QR codes for this user
        const qrCodesSnapshot = await db.collection('qrcodes')
            .where('userId', '==', userId)
            .get();
        firebase_functions_1.logger.info(`Found ${qrCodesSnapshot.size} QR codes for user ${userId}`);
        if (qrCodesSnapshot.size > 1) {
            // Sort QR codes by creation date (most recent first)
            const qrCodes = qrCodesSnapshot.docs.map(doc => {
                var _a;
                return (Object.assign(Object.assign({ id: doc.id }, doc.data()), { createdAt: ((_a = doc.data().createdAt) === null || _a === void 0 ? void 0 : _a.toDate()) || new Date(0) }));
            });
            qrCodes.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
            // Keep the most recent one, delete the rest
            const qrToKeep = qrCodes[0];
            const qrsToDelete = qrCodes.slice(1);
            firebase_functions_1.logger.info(`Keeping QR code: ${qrToKeep.id}`);
            firebase_functions_1.logger.info(`Deleting ${qrsToDelete.length} QR codes`);
            // Delete QR codes in batches
            const batch = db.batch();
            let deleteCount = 0;
            for (const qr of qrsToDelete) {
                const qrRef = db.collection('qrcodes').doc(qr.id);
                batch.delete(qrRef);
                deleteCount++;
                // Firestore batch has a limit of 500 operations
                if (deleteCount >= 500) {
                    await batch.commit();
                    deleteCount = 0;
                }
            }
            // Commit any remaining deletions
            if (deleteCount > 0) {
                await batch.commit();
            }
            firebase_functions_1.logger.info(`Successfully deleted ${qrsToDelete.length} QR codes`);
        }
        else if (qrCodesSnapshot.size === 0) {
            firebase_functions_1.logger.info('User has no QR codes to delete');
        }
        else {
            firebase_functions_1.logger.info('User has only 1 QR code, no deletion needed');
        }
        // Update user's subscription to free plan
        const subscriptionsSnapshot = await db.collection('subscriptions')
            .where('userId', '==', userId)
            .where('status', '==', 'active')
            .limit(1)
            .get();
        if (!subscriptionsSnapshot.empty) {
            const subDoc = subscriptionsSnapshot.docs[0];
            await subDoc.ref.update({
                planType: 'free',
                status: 'active',
                cancelAtPeriodEnd: false,
                updatedAt: new Date()
            });
            firebase_functions_1.logger.info('Updated subscription to free plan');
        }
        else {
            // Create a new free subscription if none exists
            const newSubscription = {
                id: `sub_${userId}_${Date.now()}`,
                userId: userId,
                planType: 'free',
                status: 'active',
                cancelAtPeriodEnd: false,
                createdAt: new Date(),
                updatedAt: new Date()
            };
            await db.collection('subscriptions').doc(newSubscription.id).set(newSubscription);
            firebase_functions_1.logger.info('Created new free subscription');
        }
        // Update user document
        await db.collection('users').doc(userId).update({
            planType: 'free',
            subscriptionStatus: 'active',
            subscriptionUpdatedAt: new Date()
        });
        firebase_functions_1.logger.info('Successfully downgraded user to free plan');
        return {
            success: true,
            message: 'Successfully downgraded to free plan',
            qrCodesDeleted: qrCodesSnapshot.size > 1 ? qrCodesSnapshot.size - 1 : 0
        };
    }
    catch (error) {
        firebase_functions_1.logger.error('Error during downgrade:', error);
        throw new https_1.HttpsError('internal', 'Failed to downgrade plan');
    }
});
//# sourceMappingURL=downgrade.js.map