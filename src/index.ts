import express from 'express';
import controller from './api/controllers/knowledges';

const app = express();
const port = process.env.PORT || 3000;

app.get('/', controller.getKnowledgeBase)
app.get('/:searchTerm', controller.getRecommendations);
app.get('/:searchTerm/:acceptedTerm', controller.addKnowledge);
app.delete('/', controller.deleteKnowledgeBase);

app.listen(port, () => {
  console.log(`Intelligent KB-API is running on port ${port}.`);
});
