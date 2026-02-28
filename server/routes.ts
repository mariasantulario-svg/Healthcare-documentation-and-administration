import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { insertTermSchema } from "@shared/schema";
import { z } from "zod";
import fs from "fs";
import path from "path";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Seed data if empty using the complete JSON file
  const existingTerms = await storage.getTerms();
  if (existingTerms.length === 0) {
    console.log("Seeding database with complete vocabulary database...");
    try {
      const jsonPath = path.join(process.cwd(), "attached_assets", "healthcare_vocabulary_COMPLETE_1770292856645.json");
      const rawData = fs.readFileSync(jsonPath, "utf-8");
      const vocabularyData = JSON.parse(rawData);

      for (const unit of vocabularyData.units) {
        for (const term of unit.vocabulary) {
          await storage.createTerm({
            term: term.term,
            definition: term.definition,
            context: term.context,
            spanish: term.spanish,
            unitNumber: unit.unitNumber,
            unitTitle: unit.unitTitle,
            course: unit.course,
            category: term.category || unit.category,
            imageUrl: term.imageUrl || null
          });
        }
      }
      console.log(`Seeding complete. Added ${vocabularyData.metadata.totalTerms} terms.`);
    } catch (error) {
      console.error("Error seeding database:", error);
    }
  }

  app.get(api.terms.list.path, async (req, res) => {
    const terms = await storage.getTerms();
    res.json(terms);
  });

  app.get(api.terms.get.path, async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(404).json({ message: "Invalid ID" });
    
    const term = await storage.getTerm(id);
    if (!term) return res.status(404).json({ message: "Term not found" });
    res.json(term);
  });

  app.post(api.terms.create.path, async (req, res) => {
    try {
      const termData = insertTermSchema.parse(req.body);
      const term = await storage.createTerm(termData);
      res.status(201).json(term);
    } catch (e) {
      if (e instanceof z.ZodError) {
        res.status(400).json({ message: e.errors[0].message });
      } else {
        res.status(500).json({ message: "Internal server error" });
      }
    }
  });

  return httpServer;
}
