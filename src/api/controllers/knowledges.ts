import {Request, Response} from 'express';
import db from '../../db';

export interface knowledge {
  searchTerm: string;
  acceptedTerm: string;
  confidenceScore: number;
}

const CONFIDENCE_THRESHOLD = 0.25;

function cleanKnowledgeBase() {
  const knowledgeBase = db.get().filter(knowledge => knowledge.confidenceScore >= CONFIDENCE_THRESHOLD);
  db.drop();
  knowledgeBase.forEach(knowledge => db.add(knowledge));
}

const getRecommendations = (req: Request, res: Response) => {
  const recommendations = db.get()
    .filter(knowledge => knowledge.searchTerm == req.params.searchTerm.toLowerCase())
    .sort((a, b) => b.confidenceScore - a.confidenceScore)
    .map(knowledge => knowledge.acceptedTerm);

  return res.status(200).json({
    message: recommendations,
  });
}

const addKnowledge = (req: Request, res: Response) => {
  const searchTerm = req.params.searchTerm.toLowerCase();
  const acceptedTerm = req.params.acceptedTerm.toLowerCase();

  if (!db.get().some(knowledge => knowledge.searchTerm == searchTerm && knowledge.acceptedTerm == acceptedTerm)) {
    db.add({searchTerm: searchTerm, acceptedTerm: acceptedTerm, confidenceScore: 0.45});
  }

  db.get()
    .filter(knowledge => knowledge.searchTerm == searchTerm)
    .forEach(knowledge => {
      if (knowledge.searchTerm == searchTerm && knowledge.acceptedTerm == acceptedTerm) {
        if (knowledge.confidenceScore <= 0.95) {
          knowledge.confidenceScore += 0.05;
        }
      } else {
        knowledge.confidenceScore -= 0.05;
      }
    });

  cleanKnowledgeBase();

  console.log(db.get());

  return res.status(200).json({
    message: 'knowledge added successfully',
  });
}

const deleteKnowledgeBase = (req: Request, res: Response) => {
  db.drop();

  return res.status(200).json({
    message: 'knowledge base deleted successfully',
  });
}

export default {getRecommendations, addKnowledge, deleteKnowledgeBase}
