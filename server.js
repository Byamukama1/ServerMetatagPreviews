const express = require('express');
const axios = require('axios');
const app = express();
const port = process.env.PORT || 3000;

// Firebase Admin setup
const admin = require('firebase-admin');
admin.initializeApp({
  credential: admin.credential.cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
  })
});

const db = admin.firestore();

app.get('/preview/:businessId', async (req, res) => {
  try {
    const businessId = req.params.businessId;
    const docRef = db.collection('businesses').doc(businessId);
    const doc = await docRef.get();

    if (!doc.exists) {
      return res.status(404).send('Business not found');
    }

    const business = doc.data();
    const imageUrl = business.mediaUrls?.[0] || 'https://via.placeholder.com/1200x630?text=Business+Preview';

    res.send(`
      <!DOCTYPE html>
      <html prefix="og: https://ogp.me/ns#">
      <head>
        <meta charset="utf-8">
        <title>${business.title || 'Business on OBlinks'}</title>
        <meta name="description" content="${business.description || 'Browse quality products on OBlinks'}">
        
        <!-- Open Graph Tags -->
        <meta property="og:title" content="${business.title || 'Business on OBlinks'}">
        <meta property="og:description" content="${business.description || 'Browse quality products on OBlinks'}">
        <meta property="og:image" content="${imageUrl}">
        <meta property="og:url" content="https://onlinemarket-ug.com/viewall.html?id=${businessId}">
        <meta property="og:type" content="website">
        
        <!-- Twitter Card Tags -->
        <meta name="twitter:card" content="summary_large_image">
        <meta name="twitter:title" content="${business.title || 'Business on OBlinks'}">
        <meta name="twitter:description" content="${business.description || 'Browse quality products on OBlinks'}">
        <meta name="twitter:image" content="${imageUrl}">
        
        <!-- Redirect to actual page -->
        <meta http-equiv="refresh" content="0; url=https://onlinemarket-ug.com/viewall.html?id=${businessId}">
      </head>
      <body>
        <p>Redirecting to <a href="https://onlinemarket-ug.com/viewall.html?id=${businessId}">business page</a>...</p>
      </body>
      </html>
    `);
  } catch (error) {
    console.error('Error generating preview:', error);
    res.status(500).send('Internal Server Error');
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});