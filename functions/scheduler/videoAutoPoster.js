/**
 * Video Auto Poster Logic
 * Syncing videos from Google Spreadsheet to Firestore
 */

const axios = require('axios');
const admin = require('firebase-admin');

const SHEET_CSV_URL = 'https://docs.google.com/spreadsheets/d/1EFIMYfhmIcfZvOZpKjOfrdKK6lnAGvCX/export?format=csv&gid=1164454597';
const VN_TIMEZONE = 'Asia/Ho_Chi_Minh';

/**
 * Helper to get today's date in format D-M-YYYY or DD-MM-YYYY
 */
function getTodayFormats() {
    const now = new Date();
    const formatter = new Intl.DateTimeFormat('en-GB', {
        timeZone: VN_TIMEZONE,
        day: 'numeric',
        month: 'numeric',
        year: 'numeric',
    });
    
    const parts = formatter.formatToParts(now);
    const d = parts.find(p => p.type === 'day').value;
    const m = parts.find(p => p.type === 'month').value;
    const y = parts.find(p => p.type === 'year').value;

    const d_num = parseInt(d);
    const m_num = parseInt(m);

    return [
        `${d}-${m}-${y}`,         // 27-03-2026
        `${d_num}-${m_num}-${y}`, // 27-3-2026
        `${d_num} - ${m_num} - ${y}`, // 27 - 3 - 2026
        `${d} - ${m} - ${y}`      // 27 - 03 - 2026
    ];
}

/**
 * Clean URL and convert Drive link
 */
function cleanAndConvertUrl(url) {
    if (!url) return null;
    let clean = url.replace(/"/g, '').trim();
    if (!clean.startsWith('http')) return null;
    
    // Convert to standard direct link for easier comparison
    const match = clean.match(/\/d\/([a-zA-Z0-9_-]+)/);
    if (match && match[1]) {
        return `https://drive.google.com/uc?id=${match[1]}`;
    }
    return clean;
}

/**
 * Main function to sync videos for today
 */
async function autoPostVideosFromSheet() {
    console.log('🎬 Video Auto Poster triggered at:', new Date().toISOString());
    
    try {
        // 1. Fetch CSV
        const response = await axios.get(SHEET_CSV_URL);
        const data = response.data;
        if (!data) throw new Error('Empty data from Google Sheet');

        // 2. Parse CSV
        const lines = data.split('\n');
        const todayFormats = getTodayFormats();
        const parsedVideos = [];
        
        // Skip header if needed, but assuming export and no header here based on logic
        lines.forEach((line) => {
            // Smarter CSV split to handle commas inside quotes
            const parts = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
            // Expecting at least 5 columns: ID, Date, URL, Title, Content
            if (parts.length >= 5) { 
                const rawUrl = parts[2].trim().replace(/"/g, '');
                const cleanUrl = cleanAndConvertUrl(rawUrl);

                if (cleanUrl) {
                    const dateStr = parts[1].trim().replace(/"/g, '');
                    const title = parts[3]?.trim().replace(/"/g, '') || `Tin tức Nông Lạc - ${dateStr}`;
                    const content = parts[4]?.trim().replace(/"/g, '') || `Cập nhật tin tức nông nghiệp ngày ${dateStr}`;
                    
                    // Match today's date
                    if (todayFormats.includes(dateStr)) {
                        parsedVideos.push({
                            date: dateStr,
                            url: cleanUrl,
                            originalDate: dateStr,
                            title: title,
                            content: content
                        });
                    }
                }
            }
        });

        if (parsedVideos.length === 0) {
            console.log('No videos found for today.');
            return { success: true, count: 0, message: 'No videos found for today.' };
        }

        console.log(`Found ${parsedVideos.length} potential videos for today.`);

        // 3. Sync to Firestore
        const db = admin.firestore();
        const postsRef = db.collection('posts');
        let addedCount = 0;

        for (const video of parsedVideos) {
            // Check if already exists (query by media url)
            // Note: Since we store it in a nested field, we can't easily query by where('media.url', '==', ...) 
            // without array-contains or similar. Better to fetch or use a simpler structure.
            // For now, let's look for any admin post today with this specific title part? 
            // Or just check all admin posts today.
            
            const existingQuery = await postsRef
                .where('isAdminPost', '==', true)
                .where('category', '==', 'news')
                .where('title', '==', video.title) // Use the specific title from CSV
                .get();
                
            // If the title exists, we assume it's already posted (or at least we check the content later)
            // To be more precise, we check the media url in the resulting docs
            let isDuplicate = false;
            existingQuery.forEach(doc => {
                const d = doc.data();
                if (d.media && d.media.some(m => m.url === video.url)) {
                    isDuplicate = true;
                }
            });

            if (!isDuplicate) {
                const postData = {
                    title: video.title,
                    content: video.content,
                    category: 'news',
                    authorId: 'laclac_knowledge',
                    authorName: 'Lạc Lạc kiến thức',
                    isAdminPost: true,
                    driveId: video.id, // Store Drive ID for existence check
                    media: [{
                        url: video.url,
                        type: 'video',
                        fileName: `video-${video.originalDate}.mp4`
                    }],
                    images: [],
                    imageUrl: null,
                    likes: 0,
                    comments: 0,
                    createdAt: admin.firestore.FieldValue.serverTimestamp(),
                    updatedAt: admin.firestore.FieldValue.serverTimestamp()
                };

                await postsRef.add(postData);
                addedCount++;
                console.log(`✅ Successfully posted video: ${video.url}`);
            } else {
                console.log(`⏭️ Skipping duplicate video: ${video.url}`);
            }
        }

        return { success: true, count: addedCount, message: `Successfully synced ${addedCount} videos.` };

    } catch (error) {
        console.error('❌ Video Auto Poster failed:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Sync a single video from Drive to Firebase Storage and Firestore
 */
async function postSingleVideoFromDrive(driveId, date, customTitle, customContent) {
    if (!driveId) throw new Error('Drive ID is required');
    const db = admin.firestore();
    const storage = admin.storage();
    
    // 1. Check if already exists
    const postsRef = db.collection('posts');
    const videoUrl = `https://drive.google.com/uc?id=${driveId}`;
    
    const existingQuery = await postsRef
        .where('isAdminPost', '==', true)
        .where('category', '==', 'news')
        .where('title', '==', `Tin tức Nông Lạc - ${date}`)
        .get();
        
    let isDuplicate = false;
    existingQuery.forEach(doc => {
        const d = doc.data();
        if (d.media && d.media.some(m => m.url.includes(driveId))) {
            isDuplicate = true;
        }
    });

    if (isDuplicate) {
        return { success: true, message: 'Video already exists', duplicated: true };
    }

    // 2. Download from Google Drive (Server-to-Server)
    console.log(`Downloading video ${driveId} from Google Drive...`);
    let downloadUrl = `https://docs.google.com/uc?export=download&id=${driveId}`;
    
    // First attempt to get the file or the confirmation token
    let response = await axios.get(downloadUrl, { 
        responseType: 'arraybuffer',
        validateStatus: false 
    });
    
    // Check if Google returned a virus scan confirmation page (HTML)
    const contentStr = response.data.toString();
    if (contentStr.includes('confirm=') && contentStr.length < 5000) {
        const confirmMatch = contentStr.match(/confirm=([a-zA-Z0-9_-]+)/);
        if (confirmMatch) {
            console.log('Detected virus scan confirmation page, retrying with confirm token...');
            const confirmToken = confirmMatch[1];
            downloadUrl = `https://docs.google.com/uc?export=download&id=${driveId}&confirm=${confirmToken}`;
            response = await axios.get(downloadUrl, { responseType: 'arraybuffer' });
        }
    }

    if (response.status !== 200) {
        throw new Error(`Google Drive returned status ${response.status}. Make sure file is public.`);
    }

    const buffer = Buffer.from(response.data);

    // 3. Upload to Firebase Storage
    console.log('Uploading to Firebase Storage...');
    // Use default bucket (safest)
    const bucket = storage.bucket();
    const fileName = `posts/auto-video-${driveId}-${Date.now()}.mp4`;
    const file = bucket.file(fileName);
    
    await file.save(buffer, {
        metadata: { 
            contentType: 'video/mp4',
            cacheControl: 'public, max-age=31536000'
        },
        resumable: false
    });
    
    // Make file public so it's streamable directly
    try {
        await file.makePublic();
    } catch (e) {
        console.warn('Failed to make file public:', e.message);
    }
    
    // Construct the public firebasestorage.app URL
    // Get bucket name dynamically
    const bucketName = bucket.name;
    const firebaseVideoUrl = `https://firebasestorage.googleapis.com/v0/b/${bucketName}/o/${encodeURIComponent(fileName)}?alt=media`;

    // 4. Create Firestore doc
    const finalTitle = customTitle || `Tin tức Nông Lạc - ${date || 'Hôm nay'}`;
    const finalContent = customContent || `Cập nhật tin tức nông nghiệp ngày ${date || 'hôm nay'}`;

    const postData = {
        title: finalTitle,
        content: finalContent,
        category: 'news',
        authorId: 'laclac_knowledge',
        authorName: 'Lạc Lạc kiến thức',
        isAdminPost: true,
        driveId: driveId, // Store Drive ID for existence check
        media: [{
            url: firebaseVideoUrl,
            type: 'video',
            fileName: `video-${date}.mp4`
        }],
        images: [],
        imageUrl: null,
        likes: 0,
        comments: 0,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };

    const docRef = await postsRef.add(postData);
    
    return { 
        success: true, 
        message: 'Successfully posted video', 
        id: docRef.id, 
        url: firebaseVideoUrl 
    };
}

module.exports = {
    autoPostVideosFromSheet,
    postSingleVideoFromDrive
};
