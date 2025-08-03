require('dotenv').config();

const express = require('express');
const admin = require('firebase-admin');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');

const app = express();
app.use(express.json());

// Construct the service account object from environment variables
const serviceAccount = {
  type: process.env.TYPE,
  project_id: process.env.PROJECT_ID,
  private_key_id: process.env.PRIVATE_KEY_ID,
  // Replace escaped newlines in the private key
  private_key: process.env.PRIVATE_KEY.replace(/\\n/g, '\n'),
  client_email: process.env.CLIENT_EMAIL,
  client_id: process.env.CLIENT_ID,
  auth_uri: process.env.AUTH_URI,
  token_uri: process.env.TOKEN_URI,
  auth_provider_x509_cert_url: process.env.AUTH_PROVIDER_X509_CERT_URL,
  client_x509_cert_url: process.env.CLIENT_X509_CERT_URL,
  universe_domain: process.env.UNIVERSE_DOMAIN
};

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const swaggerOptions = {
  swaggerDefinition: {
    info: {
      title: 'Push Notification API',
      version: '1.0.0',
      description: 'API to send push notifications using Firebase',
    },
  },
  apis: ['index.js'],
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

/**
 * @swagger
 * /:
 *   get:
 *     description: Get a welcome message
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: A welcome message
 *         schema:
 *           type: object
 *           properties:
 *             message:
 *               type: string
 */
app.get('/', (req, res) => {
  res.json({ message: 'hello hridhyam' });
});

/**
 * @swagger
 * /send-notification:
 *   post:
 *     description: Send a push notification to a specific topic
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: body
 *         in: body
 *         required: true
 *         schema:
 *           type: object
 *           properties:
 *             topic:
 *               type: string
 *             title:
 *               type: string
 *             body:
 *               type: string
 *           example:
 *             topic: common
 *             title: New Notification
 *             body: This is a test notification
 *     responses:
 *       200:
 *         description: Successfully sent message
 *       400:
 *         description: Missing required parameters
 *       500:
 *         description: Error sending message
 */
app.post('/send-notification', (req, res) => {
  const { topic, title, body } = req.body;

  if (!topic || !title || !body) {
    return res.status(400).send('Missing required parameters: topic, title, body');
  }

  const message = {
    notification: {
      title: title,
      body: body
    },
    topic: topic
  };

  admin.messaging().send(message)
    .then((response) => {
      console.log('Successfully sent message:', response);
      res.status(200).send('Successfully sent message');
    })
    .catch((error) => {
      console.error('Error sending message:', error);
      res.status(500).send('Error sending message');
    });
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
