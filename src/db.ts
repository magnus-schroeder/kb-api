import {knowledge} from './api/controllers/knowledges';

let database: knowledge[] = [];

function get(): knowledge[] {
  return database;
}

function drop(): void {
  database = [];
}

function add(knowledge: knowledge): void {
  database.push(knowledge);
}

export default {get, drop, add}
