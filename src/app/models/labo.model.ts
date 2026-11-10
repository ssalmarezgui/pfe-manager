export interface LaboRecherche {
  id?: number;
  nom: string;
  domaine: string;
  etablissement: string;
  tel: string;
  email: string;
  adresse: string;
}

export interface DashboardStats {
  totalSujets: number;
  totalEntreprises: number;
  totalLabos: number;
  sujetsEnAttente: number;
  etudiantsInscrits: number;
  repartitionParTechnologie: { [key: string]: number };
}