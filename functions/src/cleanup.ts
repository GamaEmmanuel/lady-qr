import { onSchedule } from 'firebase-functions/v2/scheduler';
import * as admin from 'firebase-admin';
import { getMainDatabase } from './index';

/**
 * Scheduled function to clean up expired guest QR codes
 * Runs every hour to delete guest QR codes that have passed their expiration time
 */
export const cleanupExpiredGuestQRCodes = onSchedule(
  {
    schedule: 'every 1 hours',
    timeZone: 'UTC',
    retryCount: 3,
  },
  async () => {
    console.log('🧹 Starting cleanup of expired guest QR codes...');

    try {
      const db = getMainDatabase();
      const now = admin.firestore.Timestamp.now();

      // Query for expired guest QR codes
      const expiredQuery = await db
        .collection('qrcodes')
        .where('isGuest', '==', true)
        .where('expiresAt', '<=', now)
        .limit(500) // Process in batches to avoid timeouts
        .get();

      if (expiredQuery.empty) {
        console.log('✅ No expired guest QR codes found');
        return;
      }

      console.log(`📊 Found ${expiredQuery.size} expired guest QR codes to delete`);

      // Delete in batches
      const batch = db.batch();
      const deletedIds: string[] = [];
      const scansToDelete: string[] = [];

      for (const doc of expiredQuery.docs) {
        batch.delete(doc.ref);
        deletedIds.push(doc.id);

        // Also find and delete associated scans
        const scansQuery = await db
          .collection('scans')
          .where('qrCodeId', '==', doc.id)
          .get();

        scansQuery.docs.forEach((scanDoc) => {
          scansToDelete.push(scanDoc.id);
        });
      }

      // Execute the batch delete for QR codes
      await batch.commit();
      console.log(`✅ Deleted ${deletedIds.length} expired guest QR codes`);
      console.log('   Deleted IDs:', deletedIds.slice(0, 10).join(', '), deletedIds.length > 10 ? '...' : '');

      // Delete scans in a separate batch if any
      if (scansToDelete.length > 0) {
        const scanBatch = db.batch();
        for (const scanId of scansToDelete.slice(0, 500)) {
          scanBatch.delete(db.collection('scans').doc(scanId));
        }
        await scanBatch.commit();
        console.log(`✅ Deleted ${Math.min(scansToDelete.length, 500)} associated scan records`);
      }

      console.log('🧹 Cleanup completed successfully');

    } catch (error) {
      console.error('❌ Cleanup error:', error);
      throw error; // Rethrow to trigger retry
    }
  }
);

/**
 * Manual cleanup function that can be triggered via HTTP
 * Useful for testing or manual cleanup
 */
import { onRequest } from 'firebase-functions/v2/https';

export const manualCleanupExpiredQRCodes = onRequest(
  {
    cors: true,
  },
  async (req, res) => {
    // Only allow POST requests
    if (req.method !== 'POST') {
      res.status(405).send('Method not allowed');
      return;
    }

    console.log('🧹 Manual cleanup triggered...');

    try {
      const db = getMainDatabase();
      const now = admin.firestore.Timestamp.now();

      // Query for expired guest QR codes
      const expiredQuery = await db
        .collection('qrcodes')
        .where('isGuest', '==', true)
        .where('expiresAt', '<=', now)
        .get();

      if (expiredQuery.empty) {
        res.json({
          success: true,
          message: 'No expired guest QR codes found',
          deletedCount: 0
        });
        return;
      }

      // Delete in batches
      const batch = db.batch();
      let deletedCount = 0;
      let scansDeleted = 0;

      for (const doc of expiredQuery.docs) {
        batch.delete(doc.ref);
        deletedCount++;

        // Also delete associated scans
        const scansQuery = await db
          .collection('scans')
          .where('qrCodeId', '==', doc.id)
          .get();

        for (const scanDoc of scansQuery.docs) {
          batch.delete(scanDoc.ref);
          scansDeleted++;
        }
      }

      await batch.commit();

      console.log(`✅ Manual cleanup: Deleted ${deletedCount} QR codes and ${scansDeleted} scans`);

      res.json({
        success: true,
        message: `Cleanup completed`,
        deletedQRCodes: deletedCount,
        deletedScans: scansDeleted
      });

    } catch (error) {
      console.error('❌ Manual cleanup error:', error);
      res.status(500).json({
        success: false,
        error: 'Cleanup failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
);

/**
 * Get statistics about guest QR codes
 */
export const getGuestQRStats = onRequest(
  {
    cors: true,
  },
  async (req, res) => {
    try {
      const db = getMainDatabase();
      const now = admin.firestore.Timestamp.now();

      // Count total guest QR codes
      const totalQuery = await db
        .collection('qrcodes')
        .where('isGuest', '==', true)
        .count()
        .get();

      // Count expired guest QR codes
      const expiredQuery = await db
        .collection('qrcodes')
        .where('isGuest', '==', true)
        .where('expiresAt', '<=', now)
        .count()
        .get();

      // Count active (not expired) guest QR codes
      const activeQuery = await db
        .collection('qrcodes')
        .where('isGuest', '==', true)
        .where('expiresAt', '>', now)
        .count()
        .get();

      res.json({
        success: true,
        stats: {
          totalGuestQRCodes: totalQuery.data().count,
          expiredGuestQRCodes: expiredQuery.data().count,
          activeGuestQRCodes: activeQuery.data().count,
          timestamp: new Date().toISOString(),
        }
      });

    } catch (error) {
      console.error('❌ Stats error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get stats',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
);
