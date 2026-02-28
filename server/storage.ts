import { terms, type Term, type InsertTerm } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

export interface IStorage {
  getTerms(): Promise<Term[]>;
  getTerm(id: number): Promise<Term | undefined>;
  createTerm(term: InsertTerm): Promise<Term>;
}

export class DatabaseStorage implements IStorage {
  async getTerms(): Promise<Term[]> {
    return await db.select().from(terms);
  }

  async getTerm(id: number): Promise<Term | undefined> {
    const [term] = await db.select().from(terms).where(eq(terms.id, id));
    return term;
  }

  async createTerm(insertTerm: InsertTerm): Promise<Term> {
    const [term] = await db.insert(terms).values(insertTerm).returning();
    return term;
  }
}

export const storage = new DatabaseStorage();
