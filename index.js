const express = require('express');
const admin = require('firebase-admin');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');

const app = express();
app.use(express.json());

const serviceAccount = require('./hridhyam-fb3ef-firebase-adminsdk-fbsvc-4dc963aa75.json');

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