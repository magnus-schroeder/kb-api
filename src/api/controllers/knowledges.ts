import {Request, Response} from 'express';
import db from '../../db';

export interface knowledge {
  searchTerm: string;
  acceptedTerm: string;
  confidenceScore: number;
}

const CONFIDENCE_THRESHOLD = process.env.CONFIDENCE_THRESHOLD || 0.2;

function cleanKnowledgeBase() {
  const knowledgeBase = db.get().filter(knowledge => knowledge.confidenceScore >= CONFIDENCE_THRESHOLD);
  db.drop();
  knowledgeBase.forEach(knowledge => db.add(knowledge));
}

const getKnowledgeBase = (req: Request, res: Response) => {
  return res.status(200).json({
    knowledgeBase: db.get(),
  });
}

const getRecommendations = (req: Request, res: Response) => {
  const recommendations = db.get()
    .filter(knowledge => knowledge.searchTerm == req.params.searchTerm.toLowerCase())
    .sort((a, b) => b.confidenceScore - a.confidenceScore)
    .map(knowledge => knowledge.acceptedTerm);

  return res.status(200).json({
    recommendations: recommendations,
  });
}

const addKnowledge = (req: Request, res: Response) => {
  const searchTerm = req.params.searchTerm.toLowerCase();
  const acceptedTerm = req.params.acceptedTerm.toLowerCase();

  if (!db.get().some(knowledge => knowledge.searchTerm == searchTerm && knowledge.acceptedTerm == acceptedTerm)) {
    db.add({searchTerm: searchTerm, acceptedTerm: acceptedTerm, confidenceScore: -1});
  }

  db.get()
    .filter(knowledge => knowledge.searchTerm == searchTerm)
    .forEach(knowledge => {
      if (knowledge.acceptedTerm == acceptedTerm) {
        knowledge.confidenceScore = knowledge.confidenceScore == -1 ? 0.5 : knowledge.confidenceScore + (1 - knowledge.confidenceScore) * 0.5
      } else {
        knowledge.confidenceScore = knowledge.confidenceScore - (1 - knowledge.confidenceScore) * 0.5;
      }
    });

  cleanKnowledgeBase();

  return res.status(200).json({
    message: 'knowledge added',
  });
}

const deleteKnowledgeBase = (req: Request, res: Response) => {
  db.drop();

  return res.status(200).json({
    message: 'knowledge base deleted',
  });
}

export default {getKnowledgeBase, getRecommendations, addKnowledge, deleteKnowledgeBase}
