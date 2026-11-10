import { Entreprise } from './entreprise.model';
import { LaboRecherche } from './labo.model';
import { User } from './user.model';

export type StatutSujet = 'EN_ATTENTE' | 'VALIDE' | 'REFUSE';

export interface SujetPFE {
  id?: number;
  titre: string;
  technologies: string;
  duree: string;
  description: string;
  statut?: StatutSujet;
  entreprise?: Entreprise;
  labo?: LaboRecherche;
  etudiant?: User;
}

export interface SujetPFERequest {
  titre: string;
  technologies: string;
  duree: string;
  description: string;
  idEntreprise?: number;
  idLabo?: number;
  idEtudiant?: number;
}